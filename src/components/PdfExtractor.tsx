
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PdfUploader from './PdfUploader';
import { BibliographyEntry } from '@/data/bibliographyData';

// This component works silently behind the scenes to extract ALL data on initial load
const PdfExtractor: React.FC = () => {
  const [extractedEntries, setExtractedEntries] = useState<BibliographyEntry[]>([]);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const handleBibliographyExtracted = (entries: BibliographyEntry[], subheadings?: Record<string, string[]>) => {
    setExtractedEntries(entries);
    
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
        // Force a window reload to retry the extraction in extreme cases
        // window.location.reload();
      }
    }
    
    // Validate entries have the required fields
    const invalidEntries = entries.filter(entry => !entry.title || !entry.id);
    if (invalidEntries.length > 0) {
      console.warn(`Found ${invalidEntries.length} entries with missing required fields.`);
    }
    
    // Store entries in sessionStorage to ensure they're available across pages
    try {
      sessionStorage.setItem('bibliographyEntries', JSON.stringify(entries));
      sessionStorage.setItem('bibliographySubheadings', JSON.stringify(subheadings || {}));
      console.log("Bibliography data saved to sessionStorage");
      
      // Force global state update (optional)
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('bibliographyLoaded', { detail: { count: entries.length } }));
      }
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
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
    
    try {
      const storedEntries = sessionStorage.getItem('bibliographyEntries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        console.log(`Found ${entries.length} stored entries in sessionStorage`);
        setExtractedEntries(entries);
        
        // Dispatch event to notify other components
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('bibliographyLoaded', { detail: { count: entries.length } }));
        }
        
        // Only show toast on bibliography page
        if (window.location.pathname === '/bibliography') {
          toast({
            title: "Bibliography Loaded",
            description: `${entries.length} entries available from session storage`,
          });
        }
      } else {
        console.log("No stored entries found, starting automatic extraction");
      }
    } catch (error) {
      console.error("Error retrieving from sessionStorage:", error);
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
