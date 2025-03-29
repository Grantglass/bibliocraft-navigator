import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { BibliographyEntry } from '@/data/bibliographyData';

// Set worker source path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfUploaderProps {
  onBibliographyExtracted: (entries: BibliographyEntry[]) => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onBibliographyExtracted }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  
  const processPdf = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Read the file
      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(30);
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setUploadProgress(50);
      
      // Extract text from all pages
      const totalPages = pdf.numPages;
      let extractedText = '';
      
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str);
        extractedText += textItems.join(' ') + '\n';
        
        setUploadProgress(50 + (i / totalPages) * 40);
      }
      
      // Process the text into bibliography entries
      const entries = parseBibliographyEntries(extractedText);
      setUploadProgress(100);
      
      // Pass the entries to the parent component
      onBibliographyExtracted(entries);
      
      toast({
        title: "PDF Processed Successfully",
        description: `Extracted ${entries.length} bibliography entries`,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error Processing PDF",
        description: "There was a problem extracting data from your PDF. Please try a different file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      processPdf(file);
    } else if (file) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };
  
  // This is a simplified parser - you'll need to adjust based on your PDF structure
  const parseBibliographyEntries = (text: string): BibliographyEntry[] => {
    const entries: BibliographyEntry[] = [];
    
    // Split text into potential entries (this is highly dependent on your PDF format)
    // This is a simplified approach - real implementation would need more sophisticated parsing
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let currentEntry: Partial<BibliographyEntry> = {};
    let entryId = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // This is where you would implement your specific parsing logic
      // Here's a very basic example that looks for patterns:
      
      // If line contains year in parentheses, it might be an author line
      if (line.match(/\(\d{4}\)/)) {
        // If we were building an entry, save it before starting a new one
        if (currentEntry.title) {
          entries.push({
            id: `entry${entryId++}`,
            title: currentEntry.title || 'Unknown Title',
            authors: currentEntry.authors || 'Unknown Author',
            year: currentEntry.year || new Date().getFullYear().toString(),
            publication: currentEntry.publication || 'Unknown Publication',
            content: currentEntry.content || 'No content available',
            category: 'academic_papers' // Default category
          });
        }
        
        // Start a new entry
        const yearMatch = line.match(/\((\d{4})\)/);
        currentEntry = {
          authors: line.split('(')[0].trim(),
          year: yearMatch ? yearMatch[1] : 'Unknown'
        };
      } 
      // If no current authors but we have a potentially meaningful line, it might be a title
      else if (!currentEntry.authors && line.length > 20) {
        currentEntry.title = line;
      }
      // If we have authors but no title yet, this might be the title
      else if (currentEntry.authors && !currentEntry.title) {
        currentEntry.title = line;
      }
      // If we have authors and title but no publication, this might be the publication
      else if (currentEntry.authors && currentEntry.title && !currentEntry.publication) {
        currentEntry.publication = line;
      }
      // Otherwise, add to content
      else if (currentEntry.authors && currentEntry.title) {
        currentEntry.content = (currentEntry.content || '') + ' ' + line;
      }
    }
    
    // Don't forget the last entry
    if (currentEntry.title) {
      entries.push({
        id: `entry${entryId}`,
        title: currentEntry.title || 'Unknown Title',
        authors: currentEntry.authors || 'Unknown Author',
        year: currentEntry.year || new Date().getFullYear().toString(),
        publication: currentEntry.publication || 'Unknown Publication',
        content: currentEntry.content || 'No content available',
        category: 'academic_papers' // Default category
      });
    }
    
    return entries;
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-biblio-navy border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-biblio-navy" />
            <p className="mb-2 text-sm text-biblio-navy"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-biblio-gray">PDF (MAX. 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-biblio-navy h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-2 text-biblio-gray">
            Processing PDF... {uploadProgress}%
          </p>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-biblio-gray mb-2">
          <AlertCircle className="inline-block mr-1" size={16} />
          The PDF parser works best with well-structured bibliography PDFs.
        </p>
        <p className="text-xs text-biblio-gray">
          You may need to manually adjust the extracted data for optimal results.
        </p>
      </div>
    </div>
  );
};

export default PdfUploader;
