
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PdfUploader from './PdfUploader';
import { BibliographyEntry } from '@/data/bibliographyData';
import { bibliographyEntries } from '@/data/bibliographyData';

// This component works silently behind the scenes to extract ALL data on initial load
const PdfExtractor: React.FC = () => {
  const [extractedEntries, setExtractedEntries] = useState<BibliographyEntry[]>([]);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    
    // Dispatch event to notify other components that data is available
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('bibliographyLoaded', { 
        detail: { 
          count: entries.length,
          chapters: [...new Set(entries.map(entry => entry.chapter).filter(Boolean))]
        } 
      }));
    }
  };

  const handleProcessingLog = (logs: string[]) => {
    setProcessingLogs(logs);
    
    // Log the processing messages for debugging
    console.log("PDF Processing logs:", logs.slice(-5));
  };

  // Use prebuilt data on mount
  useEffect(() => {
    console.log("PdfExtractor component mounted, using prebuilt data");
    setIsLoading(false);
    
    // Use prebuilt data directly
    console.log(`Using ${bibliographyEntries.length} prebuilt bibliography entries`);
    
    // Dispatch event to notify other components that data is available
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('bibliographyLoaded', { 
        detail: { 
          count: bibliographyEntries.length,
          chapters: [...new Set(bibliographyEntries.map(entry => entry.chapter).filter(Boolean))]
        } 
      }));
    }
  }, []);

  // Hidden component - we're using prebuilt data now
  return null;
};

export default PdfExtractor;
