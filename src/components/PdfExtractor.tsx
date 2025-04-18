
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
      
      // Limit the entries to a manageable size (first 2000 entries)
      // This prevents the "Invalid string length" error
      const limitedEntries = entries.slice(0, 2000);
      
      // Store entries in chunks to avoid storage limits
      const entryChunks = [];
      const chunkSize = 50; // Reduce chunk size even more
      for (let i = 0; i < limitedEntries.length; i += chunkSize) {
        entryChunks.push(limitedEntries.slice(i, i + chunkSize));
      }
      
      // Store the number of chunks
      sessionStorage.setItem('bibliographyEntryCount', limitedEntries.length.toString());
      sessionStorage.setItem('bibliographyChunkCount', entryChunks.length.toString());
      
      console.log(`Splitting ${limitedEntries.length} entries into ${entryChunks.length} chunks of size ${chunkSize}`);
      
      // Store each chunk separately with delay to prevent browser hang
      let chunkIndex = 0;
      
      const storeNextChunk = () => {
        if (chunkIndex < entryChunks.length) {
          try {
            const chunk = entryChunks[chunkIndex];
            sessionStorage.setItem(`bibliographyEntries_${chunkIndex}`, JSON.stringify(chunk));
            console.log(`Successfully stored chunk ${chunkIndex} with ${chunk.length} entries`);
            
            // Update progress
            setLoadingProgress(Math.round((chunkIndex / entryChunks.length) * 100));
            
            chunkIndex++;
            setTimeout(storeNextChunk, 10); // Small delay between chunks
          } catch (error) {
            console.error(`Error storing chunk ${chunkIndex}:`, error);
            chunkIndex++;
            setTimeout(storeNextChunk, 10);
          }
        } else {
          // All chunks stored, now store subheadings
          try {
            sessionStorage.setItem('bibliographySubheadings', JSON.stringify(subheadings || {}));
            setLoadingProgress(100);
            
            // Force global state update
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('bibliographyLoaded', { 
                detail: { 
                  count: limitedEntries.length,
                  chapters: [...new Set(limitedEntries.map(entry => entry.chapter).filter(Boolean))]
                } 
              }));
            }
            
            console.log(`Bibliography data saved to sessionStorage in ${entryChunks.length} chunks`);
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
      toast({
        title: "Storage Error",
        description: "Could not save all bibliography data to browser storage. Limited to first 2000 entries.",
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
    
    try {
      // Check if we have chunked entries
      const entryCountStr = sessionStorage.getItem('bibliographyEntryCount');
      const chunkCountStr = sessionStorage.getItem('bibliographyChunkCount');
      
      if (entryCountStr && chunkCountStr) {
        const entryCount = parseInt(entryCountStr);
        const chunkCount = parseInt(chunkCountStr);
        
        console.log(`Found ${entryCount} stored entries in ${chunkCount} chunks`);
        
        // Reconstruct entries from chunks
        const allEntries: BibliographyEntry[] = [];
        
        // Progressive loading with progress updates
        let loadedChunks = 0;
        
        const loadNextChunk = (index: number) => {
          if (index < chunkCount) {
            const chunkStr = sessionStorage.getItem(`bibliographyEntries_${index}`);
            if (chunkStr) {
              try {
                const chunk = JSON.parse(chunkStr);
                allEntries.push(...chunk);
                loadedChunks++;
                setLoadingProgress(Math.round((loadedChunks / chunkCount) * 100));
                
                // Load next chunk with a small delay to prevent UI freeze
                setTimeout(() => loadNextChunk(index + 1), 5);
              } catch (error) {
                console.error(`Error parsing chunk ${index}:`, error);
                setTimeout(() => loadNextChunk(index + 1), 5);
              }
            } else {
              setTimeout(() => loadNextChunk(index + 1), 5);
            }
          } else {
            // All chunks loaded
            console.log(`Reconstructed ${allEntries.length} entries from storage`);
            setExtractedEntries(allEntries);
            setIsLoading(false);
            
            // Dispatch event to notify other components
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('bibliographyLoaded', { 
                detail: { 
                  count: allEntries.length,
                  chapters: [...new Set(allEntries.map(entry => entry.chapter).filter(Boolean))]
                } 
              }));
            }
            
            // Only show toast on bibliography page
            if (window.location.pathname === '/bibliography') {
              toast({
                title: "Bibliography Loaded",
                description: `${allEntries.length} entries available from session storage`,
              });
            }
          }
        };
        
        // Start loading chunks
        loadNextChunk(0);
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
        minEntriesThreshold={1800}  // Set the minimum threshold to 1800 entries
      />
    </div>
  );
};

export default PdfExtractor;
