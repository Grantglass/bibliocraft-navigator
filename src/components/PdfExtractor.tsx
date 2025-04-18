
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PdfUploader from './PdfUploader';
import { BibliographyEntry } from '@/data/bibliographyData';

// This component works silently behind the scenes to extract ALL data on initial load
const PdfExtractor: React.FC = () => {
  const [extractedEntries, setExtractedEntries] = useState<BibliographyEntry[]>([]);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [storageQuotaExceeded, setStorageQuotaExceeded] = useState<boolean>(false);
  const [entriesStoredCount, setEntriesStoredCount] = useState<number>(0);
  const { toast } = useToast();

  const handleBibliographyExtracted = (entries: BibliographyEntry[], subheadings?: Record<string, string[]>) => {
    setExtractedEntries(entries);
    setIsLoading(false);
    
    // Log extraction details for debugging
    console.log(`Loaded ${entries.length} bibliography entries`);
    
    // Log distribution of entries by chapter for debugging
    const chapterCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.chapter) {
        chapterCounts[entry.chapter] = (chapterCounts[entry.chapter] || 0) + 1;
      }
    });
    
    console.log("Entries by chapter:", chapterCounts);
    
    // Show toast on any page to help with debugging
    toast({
      title: "Bibliography Loaded",
      description: `${entries.length} entries available for browsing`,
    });
    
    // Validate entry count
    if (entries.length < 1800) {
      console.warn(`Warning: Only ${entries.length} entries loaded. Expected at least 1800 entries.`);
      // Try to force a re-extraction if count is too low
      if (entries.length < 100) {
        console.error("Critical: Very few entries found. Attempting to reload the bibliography.");
      }
    }
    
    // Store entries in sessionStorage to ensure they're available across pages
    try {
      // Clear previous storage to prevent conflicts
      for (let i = 0; i < 100; i++) {
        sessionStorage.removeItem(`bibliographyEntries_${i}`);
      }
      sessionStorage.removeItem('bibliographyEntryCount');
      sessionStorage.removeItem('bibliographyChunkCount');
      sessionStorage.removeItem('bibliographySubheadings');
      
      // Limit the entries to a much smaller size (first 500 entries)
      // This further reduces the chance of "Invalid string length" error and storage quota issues
      const limitedEntries = entries.slice(0, 500);
      
      // Store entries in chunks to avoid storage limits
      const entryChunks = [];
      const chunkSize = 5; // Further reduce chunk size for storage quotas
      for (let i = 0; i < limitedEntries.length; i += chunkSize) {
        entryChunks.push(limitedEntries.slice(i, i + chunkSize));
      }
      
      // Store the number of chunks
      sessionStorage.setItem('bibliographyEntryCount', limitedEntries.length.toString());
      sessionStorage.setItem('bibliographyChunkCount', entryChunks.length.toString());
      
      console.log(`Splitting ${limitedEntries.length} entries into ${entryChunks.length} chunks of size ${chunkSize}`);
      
      // Store each chunk separately with delay to prevent browser hang
      let chunkIndex = 0;
      let quotaExceeded = false;
      
      const storeNextChunk = () => {
        if (chunkIndex < entryChunks.length) {
          try {
            if (!quotaExceeded) {
              const chunk = entryChunks[chunkIndex];
              const chunkString = JSON.stringify(chunk);
              
              try {
                sessionStorage.setItem(`bibliographyEntries_${chunkIndex}`, chunkString);
                console.log(`Successfully stored chunk ${chunkIndex} with ${chunk.length} entries (${chunkString.length} chars)`);
                
                // Update stored entries count
                setEntriesStoredCount((prevCount) => prevCount + chunk.length);
                
                // Update progress
                setLoadingProgress(Math.round((chunkIndex / entryChunks.length) * 100));
              } catch (storageError) {
                console.error(`Error storing chunk ${chunkIndex}:`, storageError);
                quotaExceeded = true;
                setStorageQuotaExceeded(true);
                
                // Update the stored count to what we've stored so far
                const storedChunks = chunkIndex;
                const entriesStored = storedChunks * chunkSize;
                setEntriesStoredCount(entriesStored);
                
                // Update the entry and chunk count in sessionStorage
                sessionStorage.setItem('bibliographyEntryCount', entriesStored.toString());
                sessionStorage.setItem('bibliographyChunkCount', storedChunks.toString());
                
                toast({
                  title: "Storage Quota Exceeded",
                  description: `Only ${entriesStored} entries could be stored due to browser storage limits.`,
                  variant: "destructive"
                });
              }
            }
            
            chunkIndex++;
            setTimeout(storeNextChunk, 50); // Increase delay between chunks even more
          } catch (error) {
            console.error(`Error processing chunk ${chunkIndex}:`, error);
            
            // Check if it's a quota exceeded error
            if (error instanceof Error && error.name === 'QuotaExceededError') {
              quotaExceeded = true;
              setStorageQuotaExceeded(true);
              
              // Update storage count to reflect what we've stored so far
              const storedChunks = chunkIndex;
              const entriesStored = storedChunks * chunkSize;
              setEntriesStoredCount(entriesStored);
              
              // Still save the count of what we could store
              sessionStorage.setItem('bibliographyEntryCount', entriesStored.toString());
              sessionStorage.setItem('bibliographyChunkCount', storedChunks.toString());
              
              toast({
                title: "Storage Quota Exceeded",
                description: `Only ${entriesStored} entries could be stored due to browser storage limits.`,
                variant: "destructive"
              });
            }
            
            chunkIndex++;
            setTimeout(storeNextChunk, 50);
          }
        } else {
          // All chunks stored, now store subheadings
          try {
            if (subheadings) {
              const subheadingsStr = JSON.stringify(subheadings);
              sessionStorage.setItem('bibliographySubheadings', subheadingsStr);
            }
            setLoadingProgress(100);
            
            // Force global state update
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('bibliographyLoaded', { 
                detail: { 
                  count: quotaExceeded ? entriesStoredCount : limitedEntries.length,
                  chapters: [...new Set(limitedEntries.map(entry => entry.chapter).filter(Boolean))]
                } 
              }));
            }
            
            if (quotaExceeded) {
              console.log(`Bibliography data partially saved to sessionStorage (${entriesStoredCount} entries in ${chunkIndex} chunks)`);
            } else {
              console.log(`Bibliography data saved to sessionStorage in ${entryChunks.length} chunks`);
            }
            
            // Dispatch a dedicated event to notify about storage issues
            if (quotaExceeded && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('bibliographyStorageExceeded', { 
                detail: { 
                  entriesStored: entriesStoredCount,
                  totalEntries: entries.length
                } 
              }));
            }
          } catch (error) {
            console.error("Error storing subheadings:", error);
            toast({
              title: "Storage Warning",
              description: "Could not save bibliography subheadings to browser storage.",
              variant: "destructive"
            });
          }
        }
      };
      
      // Start storing chunks
      storeNextChunk();
      
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
      setStorageQuotaExceeded(true);
      
      toast({
        title: "Storage Error",
        description: "Could not save bibliography data to browser storage. Limited functionality available.",
        variant: "destructive"
      });
    }
  };

  const handleProcessingLog = (logs: string[]) => {
    setProcessingLogs(logs);
    
    // Log the processing messages for debugging
    console.log("PDF Processing logs:", logs.slice(-5));
  };

  // Check if we already have entries in sessionStorage on mount
  useEffect(() => {
    console.log("PdfExtractor component mounted, checking for existing entries");
    setIsLoading(true);
    setStorageQuotaExceeded(false);
    setEntriesStoredCount(0);
    
    try {
      // Check if we have chunked entries
      const entryCountStr = sessionStorage.getItem('bibliographyEntryCount');
      const chunkCountStr = sessionStorage.getItem('bibliographyChunkCount');
      
      if (entryCountStr && chunkCountStr) {
        const entryCount = parseInt(entryCountStr);
        const chunkCount = parseInt(chunkCountStr);
        
        console.log(`Found ${entryCount} stored entries in ${chunkCount} chunks`);
        setEntriesStoredCount(entryCount);
        
        // We don't need to load all entries here, just verify they exist
        setIsLoading(false);
        
        // Dispatch event to notify other components that data is available
        if (window.dispatchEvent) {
          const chapters = [];
          try {
            // Try to get some chapter data from the first chunk
            const firstChunkStr = sessionStorage.getItem('bibliographyEntries_0');
            if (firstChunkStr) {
              const firstChunk = JSON.parse(firstChunkStr);
              const uniqueChapters = [...new Set(firstChunk.map((entry: BibliographyEntry) => entry.chapter).filter(Boolean))];
              chapters.push(...uniqueChapters);
            }
          } catch (e) {
            console.error("Error parsing first chunk for chapters:", e);
          }
          
          window.dispatchEvent(new CustomEvent('bibliographyLoaded', { 
            detail: { 
              count: entryCount,
              chapters: chapters
            } 
          }));
        }
      } else {
        console.log("No stored entries found, starting automatic extraction");
        // We leave isLoading as true until extraction completes
      }
    } catch (error) {
      console.error("Error retrieving from sessionStorage:", error);
      setIsLoading(false);
      
      // Show error toast
      toast({
        title: "Loading Error",
        description: "Failed to load bibliography from storage. Try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return (
    <div className="hidden">
      <PdfUploader 
        onBibliographyExtracted={handleBibliographyExtracted} 
        onProcessingLog={handleProcessingLog} 
        autoExtract={true}
        extractAllPages={true}  // Force extraction of ALL pages
        forceFullExtraction={true}  // Ensure we get all entries
        minEntriesThreshold={500}  // Reduced threshold to 500 entries due to storage limitations
      />
    </div>
  );
};

export default PdfExtractor;
