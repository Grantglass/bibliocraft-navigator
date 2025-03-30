
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { BibliographyEntry } from '@/data/bibliographyData';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Set worker source path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfUploaderProps {
  onBibliographyExtracted: (entries: BibliographyEntry[]) => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onBibliographyExtracted }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingInfo, setProcessingInfo] = useState('');
  const { toast } = useToast();
  
  const processPdf = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(5);
    setProcessingInfo('Initializing PDF processing...');
    
    try {
      // Create a file reader for streaming
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        setProcessingInfo('Preparing PDF document...');
        setUploadProgress(10);
        
        // Use arrayBuffer for more efficient memory handling
        const data = event.target.result as ArrayBuffer;
        
        // Configure PDF.js with better memory options
        const loadingTask = pdfjsLib.getDocument({
          data,
          // Improve memory usage with these options
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          disableFontFace: true, // Reduces memory usage
          nativeImageDecoderSupport: 'none', // Reduces memory usage
        });
        
        // Add event listener for progress
        loadingTask.onProgress = (progressData) => {
          if (progressData.total > 0) {
            const percentage = Math.round((progressData.loaded / progressData.total) * 20) + 10;
            setUploadProgress(Math.min(percentage, 30));
          }
        };
        
        const pdf = await loadingTask.promise;
        setProcessingInfo(`Processing ${pdf.numPages} pages...`);
        setUploadProgress(30);
        
        // Process pages in smaller batches to avoid memory issues
        const BATCH_SIZE = 10; // Process 10 pages at a time
        const totalPages = pdf.numPages;
        let extractedText = '';
        
        for (let i = 0; i < totalPages; i += BATCH_SIZE) {
          // Calculate batch end page
          const endPage = Math.min(i + BATCH_SIZE, totalPages);
          setProcessingInfo(`Processing pages ${i + 1}-${endPage} of ${totalPages}...`);
          
          // Process each page in the current batch
          const batchPromises = [];
          for (let j = i + 1; j <= endPage; j++) {
            batchPromises.push(processPage(pdf, j));
          }
          
          const batchResults = await Promise.all(batchPromises);
          extractedText += batchResults.join(' ');
          
          // Update progress
          const progressPercentage = 30 + ((endPage / totalPages) * 50);
          setUploadProgress(Math.round(progressPercentage));
          
          // Allow garbage collection between batches
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        setProcessingInfo('Analyzing and categorizing entries...');
        setUploadProgress(85);
        
        // Process the text into bibliography entries
        const entries = parseBibliographyEntries(extractedText);
        setUploadProgress(95);
        
        // Give UI time to update before finalizing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Pass the entries to the parent component
        onBibliographyExtracted(entries);
        setUploadProgress(100);
        
        toast({
          title: "PDF Processed Successfully",
          description: `Extracted ${entries.length} bibliography entries from ${totalPages} pages`,
        });
      };
      
      fileReader.onerror = () => {
        throw new Error('Error reading file');
      };
      
      // Read the file as an array buffer for better memory efficiency
      fileReader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error Processing PDF",
        description: "There was a problem extracting data from your PDF. Please try again or use a different file.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setProcessingInfo('');
      }, 500);
    }
  };
  
  // Helper function to process a single page
  const processPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str);
      const pageText = textItems.join(' ');
      
      // Cleanup to prevent memory leaks
      page.cleanup();
      
      return pageText;
    } catch (error) {
      console.error(`Error processing page ${pageNum}:`, error);
      return '';
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // Check file size - allow up to 50MB (instead of 10MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "The maximum file size is 50MB. Please upload a smaller file.",
          variant: "destructive",
        });
        return;
      }
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
            <p className="text-xs text-biblio-gray">PDF (MAX. 50MB)</p>
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
        <div className="mt-4 space-y-3">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center text-biblio-gray">
            {processingInfo || `Processing PDF... ${uploadProgress}%`}
          </p>
        </div>
      )}
      
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Processing large PDFs</AlertTitle>
        <AlertDescription>
          Large PDFs (20MB+) may take several minutes to process. 
          Please be patient and don't refresh the page.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PdfUploader;
