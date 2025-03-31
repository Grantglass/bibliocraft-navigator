
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PdfUploader from './PdfUploader';
import { BibliographyEntry } from '@/data/bibliographyData';
import { useToast } from '@/hooks/use-toast';

const PdfExtractor: React.FC = () => {
  const [extractedEntries, setExtractedEntries] = useState<BibliographyEntry[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const handleBibliographyExtracted = (entries: BibliographyEntry[], subheadings?: Record<string, string[]>) => {
    setExtractedEntries(entries);
    toast({
      title: "PDF Extraction Complete",
      description: `Successfully extracted ${entries.length} entries from the PDF`,
    });
  };

  const handleProcessingLog = (logs: string[]) => {
    setProcessingLogs(logs);
  };

  // Automatically start extraction when component mounts
  useEffect(() => {
    // Empty dependency array ensures this only runs once on mount
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto my-6">
      <CardHeader>
        <CardTitle>William Blake Bibliography Extractor</CardTitle>
        <CardDescription>
          Exploring bibliography entries from the William Blake PDF
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <PdfUploader 
          onBibliographyExtracted={handleBibliographyExtracted} 
          onProcessingLog={handleProcessingLog} 
          autoExtract={true}
        />
        
        {extractedEntries.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-2">Extraction Results</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-xs flex items-center gap-1"
              >
                {showDebugInfo ? <EyeOff size={14} /> : <Eye size={14} />}
                {showDebugInfo ? 'Hide Logs' : 'Show Logs'}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Successfully extracted {extractedEntries.length} bibliography entries.
            </p>
            
            {showDebugInfo && processingLogs.length > 0 && (
              <div className="p-3 border rounded-md bg-gray-50 max-h-60 overflow-auto mb-4">
                <p className="font-semibold text-sm mb-2">Processing Logs:</p>
                <ul className="text-xs space-y-1 font-mono">
                  {processingLogs.map((log, i) => (
                    <li key={i} className="text-gray-600">{log}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-3 border rounded-md bg-gray-50 max-h-60 overflow-auto">
              <ul className="text-sm space-y-2">
                {extractedEntries.slice(0, 10).map((entry, i) => (
                  <li key={i} className="p-2 hover:bg-gray-100 rounded">
                    <strong>{entry.title}</strong> by {entry.authors} ({entry.year})
                  </li>
                ))}
                {extractedEntries.length > 10 && (
                  <li className="text-gray-500 italic p-2">
                    ...and {extractedEntries.length - 10} more entries
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {extractedEntries.length > 0 && (
          <Button onClick={() => window.location.href = '/bibliography'}>
            View All Entries
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PdfExtractor;
