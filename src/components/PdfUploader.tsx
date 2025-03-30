import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { BibliographyEntry } from '@/data/bibliographyData';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Set worker source path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Path to the PDF file in the public directory - make sure this matches the actual filename
const PDF_FILE_PATH = '/blake_bibliography.pdf';

interface PdfUploaderProps {
  onBibliographyExtracted: (entries: BibliographyEntry[], subheadings?: Record<string, string[]>) => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onBibliographyExtracted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingInfo, setProcessingInfo] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Automatically load the PDF when the component mounts
  useEffect(() => {
    loadPdfFromPublicFolder();
  }, []);
  
  const loadPdfFromPublicFolder = async () => {
    setIsLoading(true);
    setProgress(5);
    setProcessingInfo('Loading bibliography from repository...');
    setDebugInfo([`Starting to process file: ${PDF_FILE_PATH}`]);
    setError(null);
    
    try {
      setProcessingInfo('Preparing PDF document...');
      setProgress(10);
      
      // Load the PDF from the public folder
      const pdfUrl = PDF_FILE_PATH;
      setDebugInfo(prev => [...prev, `Attempting to load PDF from: ${pdfUrl}`]);
      
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      loadingTask.onProgress = (progressData) => {
        if (progressData.total > 0) {
          const percentage = Math.round((progressData.loaded / progressData.total) * 20) + 10;
          setProgress(Math.min(percentage, 30));
          setDebugInfo(prev => [...prev, `Loading progress: ${progressData.loaded}/${progressData.total}`]);
        }
      };
      
      const pdf = await loadingTask.promise;
      setProcessingInfo(`Processing ${pdf.numPages} pages...`);
      setProgress(30);
      setDebugInfo(prev => [...prev, `PDF loaded with ${pdf.numPages} pages`]);
      
      const BATCH_SIZE = 5;
      const totalPages = pdf.numPages;
      let extractedText = '';
      
      for (let i = 0; i < totalPages; i += BATCH_SIZE) {
        const endPage = Math.min(i + BATCH_SIZE, totalPages);
        setProcessingInfo(`Processing pages ${i + 1}-${endPage} of ${totalPages}...`);
        setDebugInfo(prev => [...prev, `Processing batch: pages ${i + 1}-${endPage}`]);
        
        const batchPromises = [];
        for (let j = i + 1; j <= endPage; j++) {
          batchPromises.push(processPage(pdf, j));
        }
        
        const batchResults = await Promise.all(batchPromises);
        const batchText = batchResults.join(' ');
        extractedText += batchText;
        
        setDebugInfo(prev => [...prev, `Batch ${i + 1}-${endPage} extracted ${batchText.length} chars`]);
        
        const progressPercentage = 30 + ((endPage / totalPages) * 50);
        setProgress(Math.round(progressPercentage));
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setProcessingInfo('Analyzing and categorizing entries...');
      setProgress(85);
      setDebugInfo(prev => [...prev, `Total extracted text: ${extractedText.length} characters`]);
      
      const { entries, subheadings } = parseBibliographyEntries(extractedText);
      setProgress(95);
      setDebugInfo(prev => [...prev, `Parsed ${entries.length} bibliography entries and ${Object.keys(subheadings).reduce((sum, chapter) => sum + subheadings[chapter].length, 0)} subheadings`]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (entries.length > 0) {
        onBibliographyExtracted(entries, subheadings);
        setProgress(100);
        
        toast({
          title: "Bibliography Loaded Successfully",
          description: `Extracted ${entries.length} bibliography entries from ${totalPages} pages`,
        });
      } else {
        setError("No bibliography entries found in the PDF.");
        toast({
          title: "No Bibliography Entries Found",
          description: "The PDF was processed but no bibliography entries were detected.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Failed to load PDF: ${errorMessage}`);
      setDebugInfo(prev => [...prev, `Error: ${errorMessage}`]);
      toast({
        title: "Error Loading Bibliography",
        description: "There was a problem extracting data from the PDF. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setProcessingInfo('');
      }, 500);
    }
  };
  
  const processPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str);
      const pageText = textItems.join(' ');
      
      setDebugInfo(prev => [...prev, `Page ${pageNum}: ${pageText.substring(0, 50)}...`]);
      
      page.cleanup();
      
      return pageText;
    } catch (error) {
      console.error(`Error processing page ${pageNum}:`, error);
      setDebugInfo(prev => [...prev, `Error on page ${pageNum}: ${error instanceof Error ? error.message : String(error)}`]);
      return '';
    }
  };
  
  const parseBibliographyEntries = (text: string): { entries: BibliographyEntry[], subheadings: Record<string, string[]> } => {
    const entries: BibliographyEntry[] = [];
    const subheadings: Record<string, string[]> = {};
    
    const predefinedParts = [
      "PART I. TEACHING WILLIAM BLAKE",
      "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
      "PART III. EDITIONS OF BLAKE'S WRITING",
      "PART IV. BIOGRAPHIES",
      "PART V. BIBLIOGRAPHIES",
      "PART VI. CATALOGUES",
      "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
      "PART VIII. SPECIFIC WORKS BY BLAKE",
      "PART IX. COLLECTIONS OF ESSAYS ON BLAKE PUBLISHED",
      "PART X. APPENDICES"
    ];
    
    predefinedParts.forEach(part => {
      subheadings[part] = [];
    });
    
    const subheadingRegex = /(?:^|\n)([A-Z][A-Za-z\s,]+)(?:\s+\d+)?(?:\n|\r)/g;
    const contentSections = text.split(/PART [IVX]+\./);
    
    for (let i = 1; i < contentSections.length; i++) {
      const section = contentSections[i];
      const partTitle = "PART " + section.split("\n")[0].trim();
      
      const matchedPart = predefinedParts.find(part => part.startsWith(partTitle));
      
      if (matchedPart) {
        let subheadingMatch;
        while ((subheadingMatch = subheadingRegex.exec(section)) !== null) {
          const potentialSubheading = subheadingMatch[1].trim();
          
          if (potentialSubheading.length > 4 && 
              !potentialSubheading.includes("PART") && 
              !potentialSubheading.includes("APPENDIX") &&
              !potentialSubheading.match(/^[IVX]+$/) &&
              !potentialSubheading.match(/^\d+$/) &&
              potentialSubheading.split(" ").length <= 8) {
            
            if (!subheadings[matchedPart].includes(potentialSubheading)) {
              subheadings[matchedPart].push(potentialSubheading);
            }
          }
        }
      }
    }
    
    const knownSubheadings = {
      "PART I. TEACHING WILLIAM BLAKE": [
        "Citations, Annotations, and Links",
        "A Note on Specialized Terms for Researchers New to William Blake",
        "Different Blake Journals"
      ],
      "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES": [
        "General Introductions, Handbooks, and Glossaries",
        "Classic Studies Published Before 2000"
      ],
      "PART III. EDITIONS OF BLAKE'S WRITING": [
        "Standard Editions",
        "Annotated Editions of Collected or Selected Writings"
      ],
      "PART IV. BIOGRAPHIES": [
        "Brief Introductions",
        "Portraits",
        "Standard Biographies",
        "Books, Chapters, and Articles with Substantial Biographical Information",
        "Historic Biographies",
        "Popular Biographies",
        "Catherine Blake",
        "On Writing Blake's Biography",
        "Blake and Members of His Circle"
      ],
      "PART V. BIBLIOGRAPHIES": [
        "Standard Bibliographies",
        "Books and Essays with Substantial Bibliographic Content",
        "Bibliographies of Exhibitions",
        "Bibliographies of Musical Settings",
        "Annotated Bibliographies",
        "Historic Bibliographies"
      ],
      "PART VI. CATALOGUES": [
        "Standard Catalogues",
        "Historic Standard Catalogues",
        "Current Collections: Digital Collections, Collection Catalogues",
        "Major Exhibition and Sale Catalogues"
      ]
    };
    
    predefinedParts.forEach(part => {
      knownSubheadings[part as keyof typeof knownSubheadings].forEach(subheading => {
        if (!subheadings[part]?.includes(subheading)) {
          subheadings[part] = [...(subheadings[part] || []), subheading];
        }
      });
    });
    
    const referencesSectionRegex = /(?:references|bibliography|works cited|sources|citations)(?:\s|:|\n)/i;
    const referencesMatch = text.match(referencesSectionRegex);
    
    if (!referencesMatch) {
      setDebugInfo(prev => [...prev, "No references section found"]);
    } else {
      const startIndex = referencesMatch.index || 0;
      text = text.substring(startIndex);
      setDebugInfo(prev => [...prev, `References section found at position ${startIndex}`]);
    }
    
    const numberedRefs = text.split(/\[\d+\]|\(\d+\)|\d+\.\s/).filter(entry => entry.trim().length > 30);
    const authorYearRefs = text.split(/(?:[A-Z][a-z]+(?:,\s|&\s|\sand\s)[A-Za-z,\s&]+)(?:\s\()?\d{4}(?:\))?\./).filter(entry => entry.trim().length > 30);
    
    const potentialEntries = numberedRefs.length > authorYearRefs.length ? numberedRefs : authorYearRefs;
    
    let entryId = 1;
    
    for (const entry of potentialEntries) {
      const trimmedEntry = entry.trim();
      
      if (trimmedEntry.length < 30) continue;
      
      let authors = "Unknown Author";
      let year = new Date().getFullYear().toString();
      let title = "Unknown Title";
      let publication = "Unknown Publication";
      let entryChapter: string | undefined = undefined;
      let entrySubheading: string | undefined = undefined;
      
      const currentYear = new Date().getFullYear();
      const yearMatch = trimmedEntry.match(/\b(19\d{2}|20[0-2]\d)\b/);
      if (yearMatch) {
        year = yearMatch[0];
      }
      
      const titleMatch = trimmedEntry.match(/"([^"]+)"|"([^"]+)"|'([^']+)'|(?:^|\.\s)([A-Z][^.]+\.)/);
      if (titleMatch) {
        title = (titleMatch.slice(1).find(g => g !== undefined) || "").trim();
      } else if (trimmedEntry.includes('.')) {
        title = trimmedEntry.split('.')[0].trim();
      } else {
        title = trimmedEntry.substring(0, Math.min(50, trimmedEntry.length)) + "...";
      }
      
      if (yearMatch && yearMatch.index) {
        const authorText = trimmedEntry.substring(0, yearMatch.index).trim();
        if (authorText.length > 0 && authorText.length < 100) {
          authors = authorText.replace(/\.$/, '').trim();
        }
      }
      
      if (titleMatch && titleMatch.index) {
        const afterTitle = trimmedEntry.substring(titleMatch.index + titleMatch[0].length).trim();
        const pubMatch = afterTitle.match(/(?:In|Journal of|Proceedings of|Published in|Publisher:|)[^.,]+/);
        if (pubMatch) {
          publication = pubMatch[0].trim();
        }
      }
      
      if (predefinedParts.length > 0) {
        for (const part of predefinedParts) {
          if (trimmedEntry.includes(part) || 
              title.includes(part)) {
            entryChapter = part;
            break;
          }
        }
        
        if (!entryChapter) {
          for (const part of predefinedParts) {
            const shortPart = part.split('.')[0].trim();
            if (trimmedEntry.includes(shortPart) || 
                title.includes(shortPart)) {
              entryChapter = part;
              break;
            }
          }
        }
        
        if (!entryChapter) {
          if (trimmedEntry.toLowerCase().includes('teach') || 
              trimmedEntry.toLowerCase().includes('education') ||
              trimmedEntry.toLowerCase().includes('student')) {
            entryChapter = predefinedParts[0];
          } else if (trimmedEntry.toLowerCase().includes('introduction') || 
                    trimmedEntry.toLowerCase().includes('handbook') ||
                    trimmedEntry.toLowerCase().includes('glossary')) {
            entryChapter = predefinedParts[1];
          } else if (trimmedEntry.toLowerCase().includes('edition') || 
                    trimmedEntry.toLowerCase().includes('writing')) {
            entryChapter = predefinedParts[2];
          } else if (trimmedEntry.toLowerCase().includes('biography') || 
                    trimmedEntry.toLowerCase().includes('life of')) {
            entryChapter = predefinedParts[3];
          } else if (trimmedEntry.toLowerCase().includes('bibliography')) {
            entryChapter = predefinedParts[4];
          } else if (trimmedEntry.toLowerCase().includes('catalogue')) {
            entryChapter = predefinedParts[5];
          } else if (trimmedEntry.toLowerCase().includes('study') || 
                    trimmedEntry.toLowerCase().includes('subject')) {
            entryChapter = predefinedParts[6];
          } else if (publication.toLowerCase().includes('blake')) {
            entryChapter = predefinedParts[7];
          } else if (trimmedEntry.toLowerCase().includes('essay') || 
                    trimmedEntry.toLowerCase().includes('collection')) {
            entryChapter = predefinedParts[8];
          } else {
            entryChapter = predefinedParts[9];
          }
        }
        
        if (entryChapter && subheadings[entryChapter]) {
          for (const subheading of subheadings[entryChapter]) {
            if (trimmedEntry.includes(subheading) || 
                title.includes(subheading)) {
              entrySubheading = subheading;
              break;
            }
          }
        }
      }
      
      if (!entryChapter && predefinedParts.length > 0) {
        const partIndex = entryId % predefinedParts.length;
        entryChapter = predefinedParts[partIndex];
      }
      
      entries.push({
        id: `entry${entryId++}`,
        title,
        authors,
        year,
        publication,
        content: trimmedEntry,
        category: 'academic_papers',
        chapter: entryChapter,
        subheading: entrySubheading
      });
    }
    
    return { entries, subheadings };
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {!isLoading ? (
        <div className="flex flex-col items-center justify-center">
          <Button 
            onClick={loadPdfFromPublicFolder}
            className="flex items-center gap-2"
          >
            <BookOpen size={16} />
            Load Bibliography Data
          </Button>
          <p className="text-sm text-biblio-gray mt-2">
            This will load the Blake bibliography data stored in the repository.
          </p>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-biblio-gray">
            {processingInfo || `Processing PDF... ${progress}%`}
          </p>
        </div>
      )}
      
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
        <AlertTitle>Processing large PDF</AlertTitle>
        <AlertDescription>
          The bibliography is a large document that may take several minutes to process. 
          Please be patient while loading.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PdfUploader;
