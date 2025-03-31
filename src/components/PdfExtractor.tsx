
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PdfUploader from './PdfUploader';
import { BibliographyEntry } from '@/data/bibliographyData';
import { useToast } from '@/hooks/use-toast';

const PdfExtractor: React.FC = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [extractedEntries, setExtractedEntries] = useState<BibliographyEntry[]>([]);
  const { toast } = useToast();

  const handleBibliographyExtracted = (entries: BibliographyEntry[], subheadings?: Record<string, string[]>) => {
    setExtractedEntries(entries);
    toast({
      title: "PDF Extraction Complete",
      description: `Successfully extracted ${entries.length} entries from the PDF`,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-6">
      <CardHeader>
        <CardTitle>William Blake Bibliography Extractor</CardTitle>
        <CardDescription>
          Extract and explore bibliography entries from the William Blake PDF
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!showUploader ? (
          <div className="text-center p-6">
            <Button 
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-2"
            >
              <BookOpen size={16} />
              Extract Entries from PDF
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              This will process the Blake bibliography PDF and extract all entries.
            </p>
          </div>
        ) : (
          <PdfUploader onBibliographyExtracted={handleBibliographyExtracted} />
        )}
        
        {extractedEntries.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Extraction Results</h3>
            <p className="text-sm text-gray-600 mb-4">
              Successfully extracted {extractedEntries.length} bibliography entries.
            </p>
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
          <Button variant="outline" onClick={() => setShowUploader(!showUploader)}>
            {showUploader ? 'Hide Uploader' : 'Show Uploader Again'}
          </Button>
        )}
        
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
