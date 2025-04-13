
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
    
    // Show toast only on bibliography page
    if (window.location.pathname === '/bibliography') {
      toast({
        title: "Bibliography Loaded",
        description: `${entries.length} entries available for browsing`,
      });
    }
    
    // Log the entry count to help with debugging
    console.log(`Loaded ${entries.length} bibliography entries`);
    
    // If we have fewer than 1800 entries, show a warning in the console
    if (entries.length < 1800) {
      console.warn(`Warning: Only ${entries.length} entries loaded. Expected at least 1800 entries.`);
    }
  };

  const handleProcessingLog = (logs: string[]) => {
    setProcessingLogs(logs);
    
    // Log the last few messages to help with debugging
    const lastLogs = logs.slice(-5);
    console.log("PDF Processing logs:", lastLogs);
  };

  // Automatically start extraction when component mounts
  useEffect(() => {
    console.log("PdfExtractor component mounted, starting automatic extraction");
    // Empty dependency array ensures this only runs once on mount
  }, []);

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
