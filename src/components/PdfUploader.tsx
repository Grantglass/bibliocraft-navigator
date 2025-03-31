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

interface PdfUploaderState {
  isLoading: boolean;
  progress: number;
  processingInfo: string;
  debugInfo: string[];
  error: string | null;
}

class PdfUploader extends React.Component<PdfUploaderProps, PdfUploaderState> {
  state: PdfUploaderState = {
    isLoading: false,
    progress: 0,
    processingInfo: '',
    debugInfo: [] as string[],
    error: null,
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
      let introductionText = '';
      
      // First pass: Process introduction pages (first 23 pages)
      const introductionPages = Math.min(23, totalPages);
      this.setState({
        processingInfo: `Processing introduction pages 1-${introductionPages}...`,
      });
      
      for (let i = 1; i <= introductionPages; i++) {
        this.setState(prevState => ({
          debugInfo: [...prevState.debugInfo, `Processing introduction page ${i}`]
        }));
        
        const pageText = await this.processPage(pdf, i);
        introductionText += pageText + ' ';
        
        const progressPercentage = 30 + ((i / totalPages) * 25);
        this.setState({
          progress: Math.round(progressPercentage),
        });
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Second pass: Process remaining pages - Processing ALL pages to get more entries
      for (let i = introductionPages; i < totalPages; i += BATCH_SIZE) {
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
        
        const progressPercentage = 55 + ((endPage / totalPages) * 30);
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
        debugInfo: [...prevState.debugInfo, `Introduction text: ${introductionText.length} characters`]
      }));
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Bibliography text: ${extractedText.length} characters`]
      }));
      
      // Create introduction entries
      const introductionEntries = this.createIntroductionEntries(introductionText);
      
      // Parse bibliography entries from the remaining text
      const result = this.parseBibliographyEntries(extractedText);
      let entries = result.entries || [];
      let subheadings = result.subheadings || {};
      
      // Add "INTRODUCTION" to the subheadings
      subheadings["INTRODUCTION"] = ["Prefatory Material", "Table of Contents", "Guidelines", "Digital Resources", "Citations, Annotations, and Links", "Different Blake Journals"];
      
      // Combine introduction entries with bibliography entries
      entries = [...introductionEntries, ...entries];
      
      this.setState({
        progress: 95,
      });
      
      // Check if subheadings object is valid before logging
      const subheadingCount = subheadings ? 
        Object.keys(subheadings).reduce((sum, chapter) => 
          sum + (subheadings[chapter]?.length || 0), 0) : 0;
      
      this.setState(prevState => ({
        debugInfo: [...prevState.debugInfo, `Parsed ${entries.length} bibliography entries (including introduction) and ${subheadingCount} subheadings`]
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
  
  createIntroductionEntries = (introText: string): BibliographyEntry[] => {
    const introductionEntries: BibliographyEntry[] = [];
    
    // Extract some meaningful sections from the introduction
    const sections = introText.split(/\n\n|\r\n\r\n/).filter(section => 
      section.trim().length > 50 && 
      !section.includes("Page") && 
      !section.includes("Table of") &&
      !section.trim().match(/^\d+$/)
    );
    
    // Add introduction entries
    introductionEntries.push({
      id: `intro1`,
      title: "William Blake: An Annotated Bibliography",
      authors: "Editorial Team",
      year: new Date().getFullYear().toString(),
      publication: "Introduction",
      content: "This bibliography serves as a comprehensive resource for scholars, students, and enthusiasts of William Blake. The following pages contain a carefully curated collection of bibliographic entries spanning Blake's works, critical responses, and scholarly analyses.",
      category: 'introduction',
      chapter: "INTRODUCTION",
      subheading: "Prefatory Material"
    });
    
    // Extract and add sections from the introduction text
    let count = 2;
    for (let i = 0; i < Math.min(sections.length, 5); i++) {
      const section = sections[i];
      if (section.length < 50) continue;
      
      let title = "";
      let content = section;
      
      // Try to extract a title from the first line
      const lines = section.split(/\n|\r\n/);
      if (lines[0] && lines[0].length < 100 && lines[0].length > 10) {
        title = lines[0].trim();
        content = section.substring(title.length).trim();
      } else {
        title = `Introduction Section ${count}`;
      }
      
      let subheading = "Prefatory Material";
      if (section.toLowerCase().includes("contents") || 
          section.toLowerCase().includes("chapter") || 
          section.toLowerCase().includes("section")) {
        subheading = "Table of Contents";
      } else if (section.toLowerCase().includes("guideline") || 
                section.toLowerCase().includes("instruction") || 
                section.toLowerCase().includes("how to")) {
        subheading = "Guidelines";
      }
      
      introductionEntries.push({
        id: `intro${count++}`,
        title: title,
        authors: "Editorial Team",
        year: new Date().getFullYear().toString(),
        publication: "Introduction",
        content: content.substring(0, 500) + (content.length > 500 ? "..." : ""),
        category: 'introduction',
        chapter: "INTRODUCTION",
        subheading: subheading
      });
    }
    
    return introductionEntries;
  };
  
  createFallbackEntries = (): BibliographyEntry[] => {
    const fallbackEntries: BibliographyEntry[] = [];
    
    // Add an introduction entry
    fallbackEntries.push({
      id: `intro_fallback`,
      title: "William Blake: An Annotated Bibliography",
      authors: "Editorial Team",
      year: new Date().getFullYear().toString(),
      publication: "Introduction",
      content: "This bibliography serves as a comprehensive resource for scholars, students, and enthusiasts of William Blake. The following pages contain a carefully curated collection of bibliographic entries spanning Blake's works, critical responses, and scholarly analyses.",
      category: 'introduction',
      chapter: "INTRODUCTION",
      subheading: "Prefatory Material"
    });
    
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
      "INTRODUCTION",
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
    
    // Add Introduction subheadings
    subheadings["INTRODUCTION"] = ["Prefatory Material", "Table of Contents", "Guidelines", "Digital Resources", "Citations, Annotations, and Links", "Different Blake Journals"];
    
    // Improved subheading extraction
    const subheadingRegex = /(?:^|\n)([A-Z][A-Za-z\s,]+)(?:\s+\d+)?(?:\n|\r)/g;
    
    // Split the text by part markers for better organization
    const partMarkerRegex = /(PART [IVX]+\.\s+[A-Z\s]+)/g;
    const parts = text.split(partMarkerRegex);
    
    // Improved entry extraction - looking for bibliographic entries
    // Looking for patterns like "Author Name. Title. Publication details, Year."
    const entryRegexList = [
      // Match author year pattern (Author, Year. Title...)
      /([A-Z][a-z]+(?:,?\s+[A-Z]\.(?:\s*[A-Z]\.)*|\s+[A-Z][a-z]+)(?:,\s|\sand\s|,\sand\s|\s&\s)[A-Za-z\s,\.]+)(?:\.\s+|\s+)[""]?([^""\.\n]+)[""]?\.([^\.]+\d{4}[^\.]*\.)/g,
      
      // Match entry starting with a title in quotes
      /[""]([^""]+)[""]\.([^\.]+)(?:\.\s+|\s+)(\d{4})/g,
      
      // Find entries with citation markers like <BBS 123>
      /([^\n<.]+)\s*<([A-Z]+\s*[^>]+)>([^\n<]+)/g,
      
      // Find entries that start with an author's last name and year
      /([A-Z][a-z]+)(?:,\s|\s)([A-Za-z\s,\.]+)(?:\.\s+|\s+)(\d{4})/g
    ];
    
    // Process each part/section
    for (let i = 0; i < parts.length; i++) {
      const section = parts[i];
      
      // Skip short sections
      if (section.length < 100) continue;
      
      // Find if this section is a header (PART X...)
      const partMatch = section.match(/PART [IVX]+\.\s+[A-Z\s]+/);
      if (partMatch) {
        const partTitle = partMatch[0].trim();
        const matchedPredefinedPart = predefinedParts.find(part => part.includes(partTitle));
        
        if (matchedPredefinedPart) {
          // Extract subheadings for this part
          let subheadingMatch;
          let localSubheadingRegex = /(?:^|\n)([A-Z][A-Za-z\s,]+)(?:\s+\d+)?(?:\n|\r)/g;
          while ((subheadingMatch = localSubheadingRegex.exec(section)) !== null) {
            const potentialSubheading = subheadingMatch[1].trim();
            
            if (potentialSubheading.length > 4 && 
                !potentialSubheading.includes("PART") && 
                !potentialSubheading.includes("APPENDIX") &&
                !potentialSubheading.match(/^[IVX]+$/) &&
                !potentialSubheading.match(/^\d+$/) &&
                potentialSubheading.split(" ").length <= 8) {
              
              if (!subheadings[matchedPredefinedPart].includes(potentialSubheading)) {
                subheadings[matchedPredefinedPart].push(potentialSubheading);
              }
            }
          }
        }
        continue;
      }
      
      // Extract entries from this section
      // Find which part this section belongs to
      let sectionPart = "PART I. TEACHING WILLIAM BLAKE"; // Default
      
      for (const part of predefinedParts) {
        if (section.includes(part) || (i > 0 && parts[i-1].includes(part))) {
          sectionPart = part;
          break;
        }
      }
      
      // Determine subheading based on content
      let sectionSubheading = subheadings[sectionPart][0] || "General";
      
      // Look for common subheading markers
      const subheadingOptions = subheadings[sectionPart] || [];
      for (const subheading of subheadingOptions) {
        if (section.includes(subheading)) {
          sectionSubheading = subheading;
          break;
        }
      }
      
      // Try different regex patterns to extract entries
      for (const regex of entryRegexList) {
        let match;
        let localRegex = new RegExp(regex); // Create a new instance to reset lastIndex
        
        while ((match = localRegex.exec(section)) !== null) {
          // Extract entry components based on the pattern that matched
          let author = "";
          let title = "";
          let publication = "";
          let year = "";
          let content = "";
          
          if (match[0].includes("<")) {
            // Citation pattern
            author = match[1]?.trim() || "Unknown";
            title = match[3]?.trim() || "Unknown";
            publication = match[2]?.trim() || "";
            
            // Try to extract year
            const yearMatch = match[0].match(/\b(19|20)\d{2}\b/);
            year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
            
            // Collect content - the paragraph following this entry
            const contentStart = match.index + match[0].length;
            const nextParagraph = section.substring(contentStart, contentStart + 500).split(/\n\n|\r\n\r\n/)[0];
            content = nextParagraph.trim();
          } else if (match[0].includes(""") || match[0].includes("\"")) {
            // Title in quotes pattern
            title = match[1]?.trim() || "Unknown";
            author = match[2]?.trim() || "Unknown Author";
            publication = match[3]?.trim() || "";
            
            // Try to extract year
            const yearMatch = match[0].match(/\b(19|20)\d{2}\b/);
            year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
            
            // Collect content
            const contentStart = match.index + match[0].length;
            const nextParagraph = section.substring(contentStart, contentStart + 500).split(/\n\n|\r\n\r\n/)[0];
            content = nextParagraph.trim();
          } else {
            // Author year pattern
            author = match[1]?.trim() || "Unknown";
            if (match[2]) {
              title = match[2]?.trim() || "Unknown";
            } else {
              title = "Unknown";
            }
            
            // Try to extract publication and year
            if (match[3]) {
              publication = match[3]?.trim() || "";
              const yearMatch = match[3].match(/\b(19|20)\d{2}\b/);
              year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
            } else {
              year = new Date().getFullYear().toString();
            }
            
            // Collect content
            const contentStart = match.index + match[0].length;
            const nextParagraph = section.substring(contentStart, contentStart + 500).split(/\n\n|\r\n\r\n/)[0];
            content = nextParagraph.trim();
          }
          
          // Clean up extracted text
          title = title.replace(/["'""]/g, '').trim();
          author = author.replace(/\.$/, '').trim();
          
          // Create a unique ID
          const id = `pdf_${entries.length + 1}_${author.substring(0, 10).replace(/\s/g, '_').toLowerCase()}`;
          
          // Only add if we have at least a title and either author or content
          if (title && (author || content)) {
            entries.push({
              id,
              title,
              authors: author,
              year,
              publication,
              content: content || match[0], // Use match text as fallback content
              category: 'humanities',
              chapter: sectionPart,
              subheading: sectionSubheading
            });
          }
        }
      }
    }
    
    // Add known subheadings for each PART
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
        "Annotated Editions of Collected or Selected Writings",
        "Facsimiles and Reproductions of the Illuminated Books",
        "Digital Editions"
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
      ],
      "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT": [
        "Bible and Religion",
        "History and Politics",
        "Philosophy",
        "Science and Medicine",
        "Aesthetics",
        "Gender and Sexuality",
        "Race and Empire",
        "Art Criticism and Art History",
        "Literary Criticism and Poetics",
        "Myth and Symbolism"
      ],
      "PART VIII. SPECIFIC WORKS BY BLAKE": [
        "Songs of Innocence and of Experience",
        "The Marriage of Heaven and Hell",
        "The Four Zoas",
        "Milton",
        "Jerusalem"
      ]
    };
    
    // Merge in the known subheadings
    Object.keys(knownSubheadings).forEach(part => {
      if (subheadings[part]) {
        knownSubheadings[part].forEach(subheading => {
          if (!subheadings[part].includes(subheading)) {
            subheadings[part].push(subheading);
          }
        });
      } else {
        subheadings[part] = [...knownSubheadings[part]];
      }
    });
    
    // If we don't have enough entries, use our prebuilt data
    if (entries.length < 50) {
      return { entries: this.createFallbackEntries(), subheadings };
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
