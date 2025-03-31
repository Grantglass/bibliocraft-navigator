
import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { BibliographyEntry } from '@/data/bibliographyData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import PdfUploadProgress from './PdfUploadProgress';
import { processPage, createIntroductionEntries, createFallbackEntries } from '@/utils/pdfProcessing';
import { parseBibliographyEntries } from '@/utils/bibliographyParser';

// Path to the PDF file in the public directory - using absolute path to ensure proper loading
const PDF_FILE_PATH = '/blake_bibliography.pdf';

interface PdfUploaderProps {
  onBibliographyExtracted: (entries: BibliographyEntry[], subheadings?: Record<string, string[]>) => void;
  onProcessingLog?: (logs: string[]) => void;
  autoExtract?: boolean;
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
    // Auto load on the Bibliography page or if autoExtract is true
    if (window.location.pathname === '/bibliography' || this.props.autoExtract) {
      this.loadPdfFromPublicFolder();
    }
  }
  
  componentDidUpdate(prevProps: PdfUploaderProps, prevState: PdfUploaderState) {
    // If debug info has changed and we have a callback, report the logs
    if (prevState.debugInfo !== this.state.debugInfo && this.props.onProcessingLog) {
      this.props.onProcessingLog(this.state.debugInfo);
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
      
      await this.processPdfContent(pdf);
      
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
      const fallbackEntries = createFallbackEntries();
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
  
  processPdfContent = async (pdf: pdfjsLib.PDFDocumentProxy) => {
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
      
      const pageText = await processPage(pdf, i);
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
        batchPromises.push(processPage(pdf, j));
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
    
    this.analyzeAndCategorizeEntries(introductionText, extractedText);
  };
  
  analyzeAndCategorizeEntries = async (introductionText: string, bibliographyText: string) => {
    this.setState(prevState => ({
      debugInfo: [...prevState.debugInfo, `Introduction text: ${introductionText.length} characters`]
    }));
    this.setState(prevState => ({
      debugInfo: [...prevState.debugInfo, `Bibliography text: ${bibliographyText.length} characters`]
    }));
    
    // Create introduction entries
    const introductionEntries = createIntroductionEntries(introductionText);
    
    // Parse bibliography entries from the remaining text
    const result = parseBibliographyEntries(bibliographyText);
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
          (toast as HTMLElement).textContent = `Extracted ${entries.length} bibliography entries`;
        }
      }
    } else {
      this.setState({
        error: "No bibliography entries found in the PDF.",
      });
      
      // Create fallback entries if no entries were found
      const fallbackEntries = createFallbackEntries();
      this.props.onBibliographyExtracted(fallbackEntries, subheadings);
      
      if (window.location.pathname === '/bibliography') {
        const toast = document.querySelector('[role="status"]');
        if (toast) {
          (toast as HTMLElement).textContent = "Using fallback bibliography entries";
        }
      }
    }
  };
  
  render() {
    const { isLoading, progress, processingInfo, debugInfo, error } = this.state;
    const { autoExtract } = this.props;
    
    return (
      <div className="w-full max-w-md mx-auto">
        {!isLoading && !autoExtract ? (
          <div className="flex flex-col items-center justify-center">
            <Button 
              onClick={this.loadPdfFromPublicFolder}
              className="flex items-center gap-2"
            >
              <BookOpen size={16} />
              Load Bibliography Data
            </Button>
            <p className="text-sm text-biblio-gray mt-2">
              This will load the Blake bibliography data stored in the repository.
            </p>
          </div>
        ) : (
          <PdfUploadProgress 
            isLoading={isLoading}
            progress={progress}
            processingInfo={processingInfo}
            debugInfo={debugInfo}
            error={error}
          />
        )}
        
        {!autoExtract && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Processing large PDF</AlertTitle>
            <AlertDescription>
              The bibliography is a large document that may take several minutes to process. 
              Please be patient while loading.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
}

export default PdfUploader;
