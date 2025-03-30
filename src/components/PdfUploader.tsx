
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { toast } = useToast();
  
  const processPdf = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(5);
    setProcessingInfo('Initializing PDF processing...');
    setDebugInfo([`Starting to process file: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`]);
    
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
        setDebugInfo(prev => [...prev, `File loaded into memory, size: ${Math.round(data.byteLength / 1024 / 1024)}MB`]);
        
        // Configure PDF.js with compatible options
        const loadingTask = pdfjsLib.getDocument({
          data,
          // Improve memory usage with these options
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          disableFontFace: true, // Reduces memory usage
        });
        
        // Add event listener for progress
        loadingTask.onProgress = (progressData) => {
          if (progressData.total > 0) {
            const percentage = Math.round((progressData.loaded / progressData.total) * 20) + 10;
            setUploadProgress(Math.min(percentage, 30));
            setDebugInfo(prev => [...prev, `Loading progress: ${progressData.loaded}/${progressData.total}`]);
          }
        };
        
        const pdf = await loadingTask.promise;
        setProcessingInfo(`Processing ${pdf.numPages} pages...`);
        setUploadProgress(30);
        setDebugInfo(prev => [...prev, `PDF loaded with ${pdf.numPages} pages`]);
        
        // Process pages in smaller batches to avoid memory issues
        const BATCH_SIZE = 5; // Reduced batch size for larger files
        const totalPages = pdf.numPages;
        let extractedText = '';
        
        for (let i = 0; i < totalPages; i += BATCH_SIZE) {
          // Calculate batch end page
          const endPage = Math.min(i + BATCH_SIZE, totalPages);
          setProcessingInfo(`Processing pages ${i + 1}-${endPage} of ${totalPages}...`);
          setDebugInfo(prev => [...prev, `Processing batch: pages ${i + 1}-${endPage}`]);
          
          // Process each page in the current batch
          const batchPromises = [];
          for (let j = i + 1; j <= endPage; j++) {
            batchPromises.push(processPage(pdf, j));
          }
          
          const batchResults = await Promise.all(batchPromises);
          const batchText = batchResults.join(' ');
          extractedText += batchText;
          
          setDebugInfo(prev => [...prev, `Batch ${i + 1}-${endPage} extracted ${batchText.length} chars`]);
          
          // Update progress
          const progressPercentage = 30 + ((endPage / totalPages) * 50);
          setUploadProgress(Math.round(progressPercentage));
          
          // Allow garbage collection between batches
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        setProcessingInfo('Analyzing and categorizing entries...');
        setUploadProgress(85);
        setDebugInfo(prev => [...prev, `Total extracted text: ${extractedText.length} characters`]);
        
        // Process the text into bibliography entries
        const entries = parseBibliographyEntries(extractedText);
        setUploadProgress(95);
        setDebugInfo(prev => [...prev, `Parsed ${entries.length} bibliography entries`]);
        
        // Give UI time to update before finalizing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Pass the entries to the parent component
        if (entries.length > 0) {
          onBibliographyExtracted(entries);
          setUploadProgress(100);
          
          toast({
            title: "PDF Processed Successfully",
            description: `Extracted ${entries.length} bibliography entries from ${totalPages} pages`,
          });
        } else {
          toast({
            title: "No Bibliography Entries Found",
            description: "The PDF was processed but no bibliography entries were detected. Try adjusting the parser or use a different file.",
            variant: "destructive",
          });
        }
      };
      
      fileReader.onerror = () => {
        throw new Error('Error reading file');
      };
      
      // Read the file as an array buffer for better memory efficiency
      fileReader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      setDebugInfo(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
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
      
      // Log first 50 chars of each page for debugging
      setDebugInfo(prev => [...prev, `Page ${pageNum}: ${pageText.substring(0, 50)}...`]);
      
      // Cleanup to prevent memory leaks
      page.cleanup();
      
      return pageText;
    } catch (error) {
      console.error(`Error processing page ${pageNum}:`, error);
      setDebugInfo(prev => [...prev, `Error on page ${pageNum}: ${error instanceof Error ? error.message : String(error)}`]);
      return '';
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // Check file size - allow up to 50MB
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
  
  // Enhanced parser with improved detection for references and citations
  const parseBibliographyEntries = (text: string): BibliographyEntry[] => {
    const entries: BibliographyEntry[] = [];
    
    // First, try to find a references or bibliography section
    const referencesSectionRegex = /(?:references|bibliography|works cited|sources|citations)(?:\s|:|\n)/i;
    const referencesMatch = text.match(referencesSectionRegex);
    
    if (!referencesMatch) {
      setDebugInfo(prev => [...prev, "No references section found"]);
      // If no dedicated section found, we'll try to parse the whole text
    } else {
      // Extract text from the references section to the end
      const startIndex = referencesMatch.index || 0;
      text = text.substring(startIndex);
      setDebugInfo(prev => [...prev, `References section found at position ${startIndex}`]);
    }
    
    // Split by common bibliography patterns
    // Look for patterns like:
    // 1. Author(s) (YEAR). Title. Publication.
    // 2. [1] Author(s), "Title," Publication, YEAR.
    // 3. Author(s). (YEAR). Title. Publication.
    
    // First, try to split by numbered references [1], [2], etc.
    const numberedRefs = text.split(/\[\d+\]|\(\d+\)|\d+\.\s/).filter(entry => entry.trim().length > 30);
    
    // Also try to split by author year pattern
    const authorYearRefs = text.split(/(?:[A-Z][a-z]+(?:,\s|&\s|\sand\s)[A-Za-z,\s&]+)(?:\s\()?\d{4}(?:\))?\./).filter(entry => entry.trim().length > 30);
    
    // Use the result with more potential entries
    const potentialEntries = numberedRefs.length > authorYearRefs.length ? numberedRefs : authorYearRefs;
    
    setDebugInfo(prev => [...prev, `Found ${potentialEntries.length} potential entries`]);
    
    let entryId = 1;
    
    for (const entry of potentialEntries) {
      const trimmedEntry = entry.trim();
      
      // Skip very short entries that are likely not bibliography items
      if (trimmedEntry.length < 30) continue;
      
      // Try to extract author, year, title, and publication
      let authors = "Unknown Author";
      let year = new Date().getFullYear().toString();
      let title = "Unknown Title";
      let publication = "Unknown Publication";
      
      // Extract year - look for 4 digits that could be a year (between 1900 and current year)
      const currentYear = new Date().getFullYear();
      const yearMatch = trimmedEntry.match(/\b(19\d{2}|20[0-2]\d)\b/);
      if (yearMatch) {
        year = yearMatch[0];
      }
      
      // Extract title - often in quotes or followed by a period
      const titleMatch = trimmedEntry.match(/"([^"]+)"|"([^"]+)"|'([^']+)'|(?:^|\.\s)([A-Z][^.]+\.)/);
      if (titleMatch) {
        // Find the first non-undefined group
        title = (titleMatch.slice(1).find(g => g !== undefined) || "").trim();
      } else if (trimmedEntry.includes('.')) {
        // If no quotes, take the first sentence
        title = trimmedEntry.split('.')[0].trim();
      } else {
        // Take the first 50 chars as a fallback
        title = trimmedEntry.substring(0, Math.min(50, trimmedEntry.length)) + "...";
      }
      
      // Extract authors - often at the beginning before the year
      if (yearMatch && yearMatch.index) {
        const authorText = trimmedEntry.substring(0, yearMatch.index).trim();
        if (authorText.length > 0 && authorText.length < 100) {
          authors = authorText.replace(/\.$/, '').trim();
        }
      }
      
      // Extract publication - often after the title
      if (titleMatch && titleMatch.index) {
        const afterTitle = trimmedEntry.substring(titleMatch.index + titleMatch[0].length).trim();
        const pubMatch = afterTitle.match(/(?:In|Journal of|Proceedings of|Published in|Publisher:|)[^.,]+/);
        if (pubMatch) {
          publication = pubMatch[0].trim();
        }
      }
      
      entries.push({
        id: `entry${entryId++}`,
        title,
        authors,
        year,
        publication,
        content: trimmedEntry,
        category: 'academic_papers' // Default category
      });
    }
    
    setDebugInfo(prev => [...prev, `Parsed ${entries.length} bibliography entries`]);
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
      
      {/* Debug info for development */}
      {debugInfo.length > 0 && (
        <div className="mt-4 p-3 border rounded-md bg-gray-50 max-h-60 overflow-auto">
          <h4 className="font-medium mb-2 text-sm">Processing Log:</h4>
          <ul className="text-xs space-y-1 text-gray-600">
            {debugInfo.map((info, i) => (
              <li key={i}>{info}</li>
            ))}
          </ul>
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
