
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
      // Store entries in chunks to avoid storage limits
      const entryChunks = [];
      const chunkSize = 500;
      for (let i = 0; i < entries.length; i += chunkSize) {
        entryChunks.push(entries.slice(i, i + chunkSize));
      }
      
      // Store the number of chunks
      sessionStorage.setItem('bibliographyEntryCount', entries.length.toString());
      sessionStorage.setItem('bibliographyChunkCount', entryChunks.length.toString());
      
      // Store each chunk separately
      entryChunks.forEach((chunk, index) => {
        sessionStorage.setItem(`bibliographyEntries_${index}`, JSON.stringify(chunk));
      });
      
      sessionStorage.setItem('bibliographySubheadings', JSON.stringify(subheadings || {}));
      console.log(`Bibliography data saved to sessionStorage in ${entryChunks.length} chunks`);
      
      // Force global state update
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('bibliographyLoaded', { 
          detail: { 
            count: entries.length,
            chapters: [...new Set(entries.map(entry => entry.chapter).filter(Boolean))]
          } 
        }));
      }
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save bibliography data to browser storage.",
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
        for (let i = 0; i < chunkCount; i++) {
          const chunkStr = sessionStorage.getItem(`bibliographyEntries_${i}`);
          if (chunkStr) {
            const chunk = JSON.parse(chunkStr);
            allEntries.push(...chunk);
          }
        }
        
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
      } else {
        console.log("No stored entries found, starting automatic extraction");
        // We leave isLoading as true until extraction completes
      }
    } catch (error) {
      console.error("Error retrieving from sessionStorage:", error);
      setIsLoading(false);
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
