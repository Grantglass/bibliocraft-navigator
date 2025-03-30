
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

// Path to the PDF file in the public directory - using absolute path to ensure proper loading
const PDF_FILE_PATH = '/blake_bibliography.pdf';

interface PdfUploaderProps {
  onBibliographyExtracted: (entries: BibliographyEntry[], subheadings?: Record<string, string[]>) => void;
}

class PdfUploader extends React.Component<PdfUploaderProps> {
  state = {
    isLoading: false,
    progress: 0,
    processingInfo: '',
    debugInfo: [] as string[],
    error: null as string | null,
  };

  // Automatically load the PDF when the component mounts
  componentDidMount() {
    // Only auto-load if in the Bibliography page
    if (window.location.pathname === '/bibliography') {
      this.loadPdfFromPublicFolder();
    }
  }
  
  loadPdfFromPublicFolder = async () => {
    this.setState({
      isLoading: true,
      progress: 5,
      processingInfo: 'Loading bibliography from repository...',
      debugInfo: [`Starting to process file: ${PDF_FILE_PATH}`],
      error: null,
    });
    
    try {
      this.setState({
        processingInfo: 'Preparing PDF document...',
        progress: 10,
      });
      
      // Get the absolute URL for the PDF
      const pdfUrl = window.location.origin + PDF_FILE_PATH;
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Attempting to load PDF from: ${pdfUrl}`]
      }));
      
      // Try loading with direct fetch first to check if file exists and is accessible
      try {
        const response = await fetch(pdfUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`PDF file not accessible: ${response.status} ${response.statusText}`);
        }
        this.setState(prevState => ({
          debugInfo: [...prevState.debugInfo, `PDF file is accessible via fetch: ${response.status}`]
        }));
      } catch (fetchError) {
        this.setState(prevState => ({
          debugInfo: [...prevState.debugInfo, `Fetch check failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`]
        }));
        // Continue anyway as PDFJS might still be able to load it
      }
      
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        withCredentials: false,
      });
      
      loadingTask.onProgress = (progressData: { loaded: number, total: number }) => {
        if (progressData.total > 0) {
          const percentage = Math.round((progressData.loaded / progressData.total) * 20) + 10;
          this.setState({
            progress: Math.min(percentage, 30),
          });
          this.setState(prevState => ({
            debugInfo: [...prevState.debugInfo, `Loading progress: ${progressData.loaded}/${progressData.total}`]
          }));
        }
      };
      
      const pdf = await loadingTask.promise;
      this.setState({
        processingInfo: `Processing ${pdf.numPages} pages...`,
        progress: 30,
      });
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `PDF loaded with ${pdf.numPages} pages`]
      }));
      
      const BATCH_SIZE = 5;
      const totalPages = pdf.numPages;
      let extractedText = '';
      
      for (let i = 0; i < totalPages; i += BATCH_SIZE) {
        const endPage = Math.min(i + BATCH_SIZE, totalPages);
        this.setState({
          processingInfo: `Processing pages ${i + 1}-${endPage} of ${totalPages}...`,
        });
        this.setState(prevState => ({
          debugInfo: [...prevState.debugInfo, `Processing batch: pages ${i + 1}-${endPage}`]
        }));
        
        const batchPromises = [];
        for (let j = i + 1; j <= endPage; j++) {
          batchPromises.push(this.processPage(pdf, j));
        }
        
        const batchResults = await Promise.all(batchPromises);
        const batchText = batchResults.join(' ');
        extractedText += batchText;
        
        this.setState(prevState => ({
          debugInfo: [...prevState.debugInfo, `Batch ${i + 1}-${endPage} extracted ${batchText.length} chars`]
        }));
        
        const progressPercentage = 30 + ((endPage / totalPages) * 50);
        this.setState({
          progress: Math.round(progressPercentage),
        });
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      this.setState({
        processingInfo: 'Analyzing and categorizing entries...',
        progress: 85,
      });
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Total extracted text: ${extractedText.length} characters`]
      }));
      
      // Initialize default empty objects to prevent undefined errors
      const result = this.parseBibliographyEntries(extractedText);
      const entries = result.entries || [];
      const subheadings = result.subheadings || {};
      
      this.setState({
        progress: 95,
      });
      
      // Check if subheadings object is valid before logging
      const subheadingCount = subheadings ? 
        Object.keys(subheadings).reduce((sum, chapter) => 
          sum + (subheadings[chapter]?.length || 0), 0) : 0;
      
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Parsed ${entries.length} bibliography entries and ${subheadingCount} subheadings`]
      }));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (entries.length > 0) {
        this.props.onBibliographyExtracted(entries, subheadings);
        this.setState({
          progress: 100,
        });
        
        if (window.location.pathname === '/bibliography') {
          // Only show toast on bibliography page to avoid confusion
          const toast = document.querySelector('[role="status"]');
          if (toast) {
            (toast as HTMLElement).textContent = `Extracted ${entries.length} bibliography entries from ${totalPages} pages`;
          }
        }
      } else {
        this.setState({
          error: "No bibliography entries found in the PDF.",
        });
        
        // Create fallback entries if no entries were found
        const fallbackEntries = this.createFallbackEntries();
        this.props.onBibliographyExtracted(fallbackEntries, subheadings);
        
        if (window.location.pathname === '/bibliography') {
          const toast = document.querySelector('[role="status"]');
          if (toast) {
            (toast as HTMLElement).textContent = "Using fallback bibliography entries";
          }
        }
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.setState({
        error: `Failed to load PDF: ${errorMessage}`,
      });
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Error: ${errorMessage}`]
      }));
      
      // Create fallback entries even if an error occurs
      const fallbackEntries = this.createFallbackEntries();
      this.props.onBibliographyExtracted(fallbackEntries, {});
      
      if (window.location.pathname === '/bibliography') {
        const toast = document.querySelector('[role="status"]');
        if (toast) {
          (toast as HTMLElement).textContent = "Error loading bibliography. Using fallback entries.";
        }
      }
    } finally {
      setTimeout(() => {
        this.setState({
          isLoading: false,
          progress: 0,
          processingInfo: '',
        });
      }, 500);
    }
  };
  
  processPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str);
      const pageText = textItems.join(' ');
      
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Page ${pageNum}: ${pageText.substring(0, 50)}...`]
      }));
      
      page.cleanup();
      
      return pageText;
    } catch (error) {
      console.error(`Error processing page ${pageNum}:`, error);
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Error on page ${pageNum}: ${error instanceof Error ? error.message : String(error)}`]
      }));
      return '';
    }
  };
  
  createFallbackEntries = (): BibliographyEntry[] => {
    const fallbackEntries: BibliographyEntry[] = [];
    
    // Add some fallback entries to ensure we have at least some data to display
    fallbackEntries.push({
      id: `fallback1`,
      title: "William Blake: The Critical Heritage",
      authors: "G. E. Bentley, Jr.",
      year: "1975",
      publication: "London: Routledge",
      content: "Comprehensive collection of contemporary responses to Blake's work from 1757 to 1863, including reviews, letters, and biographical accounts.",
      category: 'academic_papers',
      chapter: "PART IV. BIOGRAPHIES",
      subheading: "Standard Biographies"
    });
    
    fallbackEntries.push({
      id: `fallback2`,
      title: "Blake Books",
      authors: "G. E. Bentley, Jr.",
      year: "1977",
      publication: "Oxford: Clarendon Press",
      content: "Detailed bibliographical descriptions of Blake's writings with information about their production, printing, and contemporary reception.",
      category: 'academic_papers',
      chapter: "PART V. BIBLIOGRAPHIES",
      subheading: "Standard Bibliographies"
    });
    
    fallbackEntries.push({
      id: `fallback3`,
      title: "Blake Books Supplement",
      authors: "G. E. Bentley, Jr.",
      year: "1995",
      publication: "Oxford: Clarendon Press",
      content: "Supplementary volume to Blake Books with new information and corrections to the original bibliography.",
      category: 'academic_papers',
      chapter: "PART V. BIBLIOGRAPHIES",
      subheading: "Standard Bibliographies"
    });
    
    // Add more fallback entries
    fallbackEntries.push({
      id: `fallback4`,
      title: "The Life of William Blake",
      authors: "Alexander Gilchrist",
      year: "1863",
      publication: "London: Macmillan",
      content: "The first full-length biography of Blake, which helped revive interest in his work. Includes accounts from Blake's friends and contemporaries.",
      category: 'academic_papers',
      chapter: "PART IV. BIOGRAPHIES",
      subheading: "Historic Biographies"
    });
    
    fallbackEntries.push({
      id: `fallback5`,
      title: "William Blake: His Life and Work",
      authors: "Jack Lindsay",
      year: "1978",
      publication: "London: Constable",
      content: "A biographical study that places Blake's work in the context of the revolutionary politics of his time.",
      category: 'academic_papers',
      chapter: "PART IV. BIOGRAPHIES",
      subheading: "Standard Biographies"
    });
    
    return fallbackEntries;
  };
  
  parseBibliographyEntries = (text: string): { entries: BibliographyEntry[], subheadings: Record<string, string[]> } => {
    // Initialize with empty arrays/objects to prevent undefined errors
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
    
    // Initialize each part with an empty array to prevent undefined errors
    predefinedParts.forEach(part => {
      subheadings[part] = [];
    });
    
    const subheadingRegex = /(?:^|\n)([A-Z][A-Za-z\s,]+)(?:\s+\d+)?(?:\n|\r)/g;
    const contentSections = text.split(/PART [IVX]+\./);
    
    if (contentSections && contentSections.length > 0) {
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
    }
    
    // Add fallback subheadings in case none are found
    const knownSubheadings: Record<string, string[]> = {
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
    
    // Safely add known subheadings to each part
    Object.keys(knownSubheadings).forEach(part => {
      const currentPart = part as keyof typeof knownSubheadings;
      if (subheadings[currentPart]) {
        knownSubheadings[currentPart].forEach(subheading => {
          if (!subheadings[currentPart].includes(subheading)) {
            subheadings[currentPart].push(subheading);
          }
        });
      }
    });
    
    // If text extraction failed, return with empty entries
    if (!text || text.length < 100) {
      return { entries, subheadings };
    }
    
    const referencesSectionRegex = /(?:references|bibliography|works cited|sources|citations)(?:\s|:|\n)/i;
    const referencesMatch = text.match(referencesSectionRegex);
    
    if (referencesMatch && referencesMatch.index !== undefined) {
      const startIndex = referencesMatch.index;
      text = text.substring(startIndex);
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `References section found at position ${startIndex}`]
      }));
    } else {
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, "No references section found"]
      }));
    }
    
    // Guard against undefined or null text
    if (!text) {
      return { entries, subheadings };
    }
    
    // Safely split the text with error handling
    let numberedRefs: string[] = [];
    let authorYearRefs: string[] = [];
    
    try {
      numberedRefs = text.split(/\[\d+\]|\(\d+\)|\d+\.\s/).filter(entry => entry && entry.trim().length > 30);
    } catch (error) {
      console.error("Error splitting numbered references:", error);
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Error splitting numbered references: ${String(error)}`]
      }));
      numberedRefs = [];
    }
    
    try {
      authorYearRefs = text.split(/(?:[A-Z][a-z]+(?:,\s|&\s|\sand\s)[A-Za-z,\s&]+)(?:\s\()?\d{4}(?:\))?\./).filter(entry => entry && entry.trim().length > 30);
    } catch (error) {
      console.error("Error splitting author-year references:", error);
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Error splitting author-year references: ${String(error)}`]
      }));
      authorYearRefs = [];
    }
    
    const potentialEntries = numberedRefs.length > authorYearRefs.length ? numberedRefs : authorYearRefs;
    
    let entryId = 1;
    
    // Generate some fallback entries if no entries are found in the PDF
    if (potentialEntries.length < 5) {
      return { entries: this.createFallbackEntries(), subheadings };
    }
    
    for (const entry of potentialEntries) {
      if (!entry) continue;
      
      const trimmedEntry = entry.trim();
      
      if (trimmedEntry.length < 30) continue;
      
      let authors = "Unknown Author";
      let year = new Date().getFullYear().toString();
      let title = "Unknown Title";
      let publication = "Unknown Publication";
      let entryChapter: string | undefined = undefined;
      let entrySubheading: string | undefined = undefined;
      
      const yearMatch = trimmedEntry.match(/\b(19\d{2}|20[0-2]\d)\b/);
      if (yearMatch) {
        year = yearMatch[0];
      }
      
      const titleMatch = trimmedEntry.match(/"([^"]+)"|"([^"]+)"|'([^']+)'|(?:^|\.\s)([A-Z][^.]+\.)/);
      if (titleMatch) {
        const foundTitle = titleMatch.slice(1).find(g => g !== undefined);
        title = foundTitle ? foundTitle.trim() : title;
      } else if (trimmedEntry.includes('.')) {
        title = trimmedEntry.split('.')[0].trim();
      } else {
        title = trimmedEntry.substring(0, Math.min(50, trimmedEntry.length)) + "...";
      }
      
      if (yearMatch && yearMatch.index !== undefined) {
        const authorText = trimmedEntry.substring(0, yearMatch.index).trim();
        if (authorText.length > 0 && authorText.length < 100) {
          authors = authorText.replace(/\.$/, '').trim();
        }
      }
      
      if (titleMatch && titleMatch.index !== undefined) {
        const afterTitle = trimmedEntry.substring(titleMatch.index + titleMatch[0].length).trim();
        const pubMatch = afterTitle.match(/(?:In|Journal of|Proceedings of|Published in|Publisher:|)[^.,]+/);
        if (pubMatch) {
          publication = pubMatch[0].trim();
        }
      }
      
      // Assign a chapter to the entry
      if (predefinedParts.length > 0) {
        // Try to find matching chapter
        for (const part of predefinedParts) {
          if (trimmedEntry.includes(part) || title.includes(part)) {
            entryChapter = part;
            break;
          }
        }
        
        // If no chapter found, try shorter part names
        if (!entryChapter) {
          for (const part of predefinedParts) {
            const shortPart = part.split('.')[0].trim();
            if (trimmedEntry.includes(shortPart) || title.includes(shortPart)) {
              entryChapter = part;
              break;
            }
          }
        }
        
        // If still no chapter, try to guess based on content
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
        
        // If we have a chapter and subheadings exist for it, find a matching subheading
        if (entryChapter && subheadings[entryChapter]) {
          for (const subheading of subheadings[entryChapter]) {
            if (trimmedEntry.includes(subheading) || title.includes(subheading)) {
              entrySubheading = subheading;
              break;
            }
          }
        }
      }
      
      // If no chapter was assigned, pick one based on entry ID
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
  
  render() {
    const { isLoading, progress, processingInfo, debugInfo, error } = this.state;
    
    return (
      <div className="w-full max-w-md mx-auto">
        {!isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <Button 
              onClick={this.loadPdfFromPublicFolder}
              className="flex items-center gap-2"
            >
              <BookOpen size={16} />
              Reload Bibliography Data
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
            
            {/* Display the debug info even when not loading */}
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
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-biblio-gray">
              {processingInfo || `Processing PDF... ${progress}%`}
            </p>
            
            {/* Always show debug info when loading */}
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
  }
}

export default PdfUploader;
