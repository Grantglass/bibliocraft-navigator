
import React, { useState, useEffect } from 'react';
import BibliographySidebar from '@/components/BibliographySidebar';
import BibliographyContent from '@/components/BibliographyContent';
import PdfUploader from '@/components/PdfUploader';
import { 
  getAllEntries, 
  searchEntries,
  BibliographyEntry,
  categorizeEntries,
  bibliographySubheadings
} from '@/data/bibliographyData';
import { Menu, ArrowLeft, BookOpen, Filter, Loader, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Bibliography = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chapterFromUrl = queryParams.get('chapter') || '';

  // Initialize with all entries from the data function
  const initialEntries = getAllEntries();
  const [entries, setEntries] = useState<BibliographyEntry[]>(initialEntries);
  const [allEntries, setAllEntries] = useState<BibliographyEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(chapterFromUrl);
  const [selectedSubheading, setSelectedSubheading] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState<string[]>([]);
  const [subheadings, setSubheadings] = useState<Record<string, string[]>>(bibliographySubheadings);
  const [showPdfUploader, setShowPdfUploader] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const { toast } = useToast();
  
  // For responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load entries from sessionStorage on mount
  useEffect(() => {
    console.log("Bibliography component mounted, checking for entries in sessionStorage");
    setIsLoading(true);
    
    try {
      // Check if we have chunked entries
      const entryCountStr = sessionStorage.getItem('bibliographyEntryCount');
      const chunkCountStr = sessionStorage.getItem('bibliographyChunkCount');
      
      if (entryCountStr && chunkCountStr) {
        const entryCount = parseInt(entryCountStr);
        const chunkCount = parseInt(chunkCountStr);
        
        console.log(`Bibliography: Found ${entryCount} stored entries in ${chunkCount} chunks`);
        
        // Reconstruct entries from chunks
        const allEntries: BibliographyEntry[] = [];
        setStorageError(false);
        
        // Progressive loading with progress updates
        let loadedChunks = 0;
        let errorOccurred = false;
        
        const loadNextChunk = (index: number) => {
          if (index < chunkCount && !errorOccurred) {
            const chunkStr = sessionStorage.getItem(`bibliographyEntries_${index}`);
            if (chunkStr) {
              try {
                const chunk = JSON.parse(chunkStr);
                allEntries.push(...chunk);
                loadedChunks++;
                
                // Load next chunk with a small delay to prevent UI freeze
                setTimeout(() => loadNextChunk(index + 1), 10);
              } catch (error) {
                console.error(`Bibliography: Error parsing chunk ${index}:`, error);
                errorOccurred = true;
                setStorageError(true);
                setIsLoading(false);
                setLoadAttempted(true);
                toast({
                  title: "Data Error",
                  description: "There was an error loading the bibliography data. Try refreshing the page.",
                  variant: "destructive"
                });
              }
            } else {
              console.log(`Bibliography: Missing chunk ${index}`);
              setTimeout(() => loadNextChunk(index + 1), 10);
            }
          } else {
            if (!errorOccurred) {
              // All chunks loaded or there was an error
              console.log(`Bibliography: Reconstructed ${allEntries.length} entries from storage`);
              
              if (allEntries.length > 0) {
                setAllEntries(allEntries);
                
                // If no category is selected, show all entries
                if (!selectedCategory) {
                  setEntries(allEntries);
                }
                
                // Also load subheadings if available
                const storedSubheadings = sessionStorage.getItem('bibliographySubheadings');
                if (storedSubheadings) {
                  try {
                    const parsedSubheadings = JSON.parse(storedSubheadings);
                    setSubheadings({...bibliographySubheadings, ...parsedSubheadings});
                  } catch (error) {
                    console.error("Error parsing subheadings:", error);
                  }
                }
              } else {
                // No entries were loaded, use the default ones
                console.log("No entries loaded from sessionStorage, using default entries");
                setStorageError(true);
              }
              
              setIsLoading(false);
              setLoadAttempted(true);
            }
          }
        };
        
        // Start loading chunks
        loadNextChunk(0);
      } else {
        console.log("Bibliography: No entries found in sessionStorage, falling back to default data");
        setStorageError(true);
        setIsLoading(false);
        setLoadAttempted(true);
      }
    } catch (error) {
      console.error("Bibliography: Error reading from sessionStorage:", error);
      setIsLoading(false);
      setStorageError(true);
      setLoadAttempted(true);
      
      toast({
        title: "Storage Error",
        description: "Failed to access browser storage. Try using a different browser.",
        variant: "destructive"
      });
    }
  }, [selectedCategory, toast]);

  // Listen for bibliographyLoaded event
  useEffect(() => {
    const handleBibliographyLoaded = (event: CustomEvent) => {
      const count = event.detail?.count || 0;
      const loadedChapters = event.detail?.chapters || [];
      
      console.log("Bibliography: Bibliography loaded event received, count:", count);
      
      try {
        // Check if we have chunked entries
        const entryCountStr = sessionStorage.getItem('bibliographyEntryCount');
        const chunkCountStr = sessionStorage.getItem('bibliographyChunkCount');
        
        if (entryCountStr && chunkCountStr) {
          const entryCount = parseInt(entryCountStr);
          const chunkCount = parseInt(chunkCountStr);
          
          console.log(`Bibliography: Found ${entryCount} stored entries in ${chunkCount} chunks`);
          
          // Reconstruct entries from chunks
          const allEntries: BibliographyEntry[] = [];
          
          // Progressive loading with progress updates
          let loadedChunks = 0;
          let errorOccurred = false;
          
          const loadNextChunk = (index: number) => {
            if (index < chunkCount && !errorOccurred) {
              const chunkStr = sessionStorage.getItem(`bibliographyEntries_${index}`);
              if (chunkStr) {
                try {
                  const chunk = JSON.parse(chunkStr);
                  allEntries.push(...chunk);
                  loadedChunks++;
                  
                  // Load next chunk with a small delay to prevent UI freeze
                  setTimeout(() => loadNextChunk(index + 1), 10);
                } catch (error) {
                  console.error(`Bibliography: Error parsing chunk ${index}:`, error);
                  errorOccurred = true;
                  setStorageError(true);
                  setIsLoading(false);
                  
                  toast({
                    title: "Data Error",
                    description: "There was an error loading some bibliography data.",
                    variant: "destructive"
                  });
                }
              } else {
                console.log(`Bibliography: Missing chunk ${index}`);
                setTimeout(() => loadNextChunk(index + 1), 10);
              }
            } else {
              if (!errorOccurred) {
                // All chunks loaded
                console.log(`Bibliography: Reconstructed ${allEntries.length} entries from storage`);
                
                if (allEntries.length > 0) {
                  setAllEntries(allEntries);
                  
                  // If no category is selected, show all entries
                  if (!selectedCategory) {
                    setEntries(allEntries);
                  }
                  
                  toast({
                    title: "Bibliography Updated",
                    description: `${allEntries.length} entries now available`,
                  });
                } else {
                  setStorageError(true);
                }
                
                setIsLoading(false);
                setLoadAttempted(true);
              }
            }
          };
          
          // Start loading chunks
          loadNextChunk(0);
        }
      } catch (error) {
        console.error("Bibliography: Error reading from sessionStorage after load event:", error);
        setStorageError(true);
        setLoadAttempted(true);
      }
    };
    
    window.addEventListener('bibliographyLoaded', handleBibliographyLoaded as EventListener);
    
    return () => {
      window.removeEventListener('bibliographyLoaded', handleBibliographyLoaded as EventListener);
    };
  }, [toast, selectedCategory]);

  // Process URL parameters when they change
  useEffect(() => {
    if (chapterFromUrl && allEntries.length > 0) {
      handleSelectCategory(chapterFromUrl);
    }
  }, [chapterFromUrl, allEntries]);

  // Extract unique chapters from entries - now using pre-loaded data
  useEffect(() => {
    if (allEntries.length > 0) {
      // Extract all PART chapters (I-X)
      const partChapters = [
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
      
      // Get chapters that exist in the entries
      const availableChapters = allEntries
        .filter(entry => entry.chapter)
        .map(entry => entry.chapter as string);
      
      // Create a set of unique chapters focusing only on full chapter names
      const uniqueChapters = new Set<string>();
      
      // First add all the predefined part chapters that exist in availableChapters
      partChapters.forEach(chapter => {
        // Check if this chapter or any chapter starting with this prefix exists
        const exists = availableChapters.some(availableChapter => 
          availableChapter === chapter || 
          availableChapter.startsWith(chapter + ' ') ||
          availableChapter.startsWith(chapter + '.')
        );
        
        if (exists) {
          uniqueChapters.add(chapter);
        }
      });
      
      // Filter out abbreviated chapter versions (e.g., "PART V") 
      // when the full version (e.g., "PART V. BIBLIOGRAPHIES") exists
      const chaptersList = Array.from(uniqueChapters);
      const filteredChapters = chaptersList.filter(chapter => {
        // If this is a full chapter name (contains a dot), keep it
        if (chapter.includes('.')) {
          return true;
        }
        
        // If this is an abbreviated chapter name, check if a full version exists
        const prefix = chapter.trim();
        const fullVersionExists = chaptersList.some(fullChapter => 
          fullChapter !== chapter && fullChapter.startsWith(prefix + '.')
        );
        
        // Only keep if no full version exists
        return !fullVersionExists;
      });
      
      const sortedChapters = filteredChapters.sort((a, b) => {
        // Special case for INTRODUCTION - always first
        if (a === "INTRODUCTION") return -1;
        if (b === "INTRODUCTION") return 1;
        
        // Extract Roman numerals or numbers for sorting
        const getPartNumber = (str: string) => {
          const match = str.match(/PART\s+([IVXLCDM]+|[0-9]+)/i);
          return match ? match[1] : '';
        };
        
        const aNum = getPartNumber(a);
        const bNum = getPartNumber(b);
        
        // Convert Roman numerals to numbers for comparison
        const romanToNum = (roman: string) => {
          if (/^[0-9]+$/.test(roman)) return parseInt(roman, 10);
          
          const romanValues: Record<string, number> = {
            I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000
          };
          
          let result = 0;
          for (let i = 0; i < roman.length; i++) {
            const current = romanValues[roman[i] as keyof typeof romanValues] || 0;
            const next = romanValues[roman[i + 1] as keyof typeof romanValues] || 0;
            if (current < next) {
              result -= current;
            } else {
              result += current;
            }
          }
          return result;
        };
        
        return romanToNum(aNum) - romanToNum(bNum);
      });
      
      setChapters(sortedChapters);
      console.log("Bibliography: Updated chapters list:", sortedChapters);
      
      // If chapters are available and no category is selected, select the first chapter
      if (sortedChapters.length > 0 && !selectedCategory) {
        handleSelectCategory(sortedChapters[0]);
      }
    }
  }, [allEntries, selectedCategory]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSelectCategory = (categoryId: string) => {
    console.log("Bibliography: Selecting category:", categoryId);
    setIsLoading(true);
    setSearchQuery('');
    
    // Check if this is a category.subheading format
    if (categoryId.includes('.')) {
      const [chapter, subheading] = categoryId.split('.');
      setSelectedCategory(chapter);
      setSelectedSubheading(subheading);
      
      setTimeout(() => {
        // Filter entries by the selected chapter and subheading
        const subheadingEntries = allEntries.filter(entry => 
          entry.chapter === chapter && entry.subheading === subheading
        );
        
        console.log(`Bibliography: Found ${subheadingEntries.length} entries for ${chapter} - ${subheading}`);
        setEntries(subheadingEntries);
        setIsLoading(false);
        
        // On mobile, close sidebar after selection
        if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
        }
      }, 300);
      
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubheading('');
      
      setTimeout(() => {
        // Filter entries by the selected chapter
        const chapterEntries = allEntries.filter(entry => {
          // Match entries that have this exact chapter or are part of this chapter
          return entry.chapter === categoryId || 
                (entry.chapter && entry.chapter.startsWith(categoryId + '.'));
        });
        
        console.log(`Bibliography: Found ${chapterEntries.length} entries for ${categoryId}`);
        setEntries(chapterEntries);
        setIsLoading(false);
        
        // On mobile, close sidebar after selection
        if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
        }
      }, 300);
    }
  };

  const handleSelectEntry = (entryId: string) => {
    setIsLoading(true);
    setSearchQuery('');
    
    setTimeout(() => {
      const selectedEntry = allEntries.find(entry => entry.id === entryId);
      setEntries(selectedEntry ? [selectedEntry] : []);
      if (selectedEntry?.chapter) {
        setSelectedCategory(selectedEntry.chapter);
        setSelectedSubheading(selectedEntry.subheading || '');
      }
      setIsLoading(false);
      
      // On mobile, close sidebar after selection
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }, 300);
  };

  const handleSearch = (query: string) => {
    if (query.trim() === '') return;
    
    setIsLoading(true);
    setSearchQuery(query);
    setSelectedCategory('');
    setSelectedSubheading('');
    
    setTimeout(() => {
      const results = searchEntries(query, allEntries);
      setEntries(results);
      setIsLoading(false);
      
      // On mobile, close sidebar after search
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }, 300);
  };

  const handleBibliographyExtracted = (extractedEntries: BibliographyEntry[], extractedSubheadings?: Record<string, string[]>) => {
    if (extractedEntries.length > 0) {
      // Categorize the new entries
      const categorizedEntries = categorizeEntries(extractedEntries);
      
      // Combine with existing entries, avoiding duplicates
      const combinedEntries = [...allEntries];
      
      // Add only new entries that don't have matching IDs
      const existingIds = new Set(allEntries.map(entry => entry.id));
      
      categorizedEntries.forEach(entry => {
        if (!existingIds.has(entry.id)) {
          combinedEntries.push(entry);
          existingIds.add(entry.id);
        }
      });
      
      setAllEntries(combinedEntries);
      
      // Update current view if no category is selected
      if (!selectedCategory) {
        setEntries(combinedEntries);
      }
      
      // Merge subheadings
      if (extractedSubheadings) {
        const mergedSubheadings = { ...subheadings };
        
        Object.keys(extractedSubheadings).forEach(chapter => {
          if (!mergedSubheadings[chapter]) {
            mergedSubheadings[chapter] = [];
          }
          
          extractedSubheadings[chapter].forEach(subheading => {
            if (!mergedSubheadings[chapter].includes(subheading)) {
              mergedSubheadings[chapter].push(subheading);
            }
          });
        });
        
        setSubheadings(mergedSubheadings);
      }
      
      toast({
        title: "Bibliography Processed",
        description: `Successfully processed ${categorizedEntries.length} entries from the PDF.`,
      });
      
      // Hide the uploader after processing
      setShowPdfUploader(false);
    }
  };

  const handleRefresh = () => {
    // Clear session storage
    try {
      // Clear all existing bibliography data
      for (let i = 0; i < 100; i++) {
        sessionStorage.removeItem(`bibliographyEntries_${i}`);
      }
      sessionStorage.removeItem('bibliographyEntryCount');
      sessionStorage.removeItem('bibliographyChunkCount');
      sessionStorage.removeItem('bibliographySubheadings');
      
      // Reload the page to trigger fresh extraction
      window.location.reload();
      
      toast({
        title: "Refreshing Bibliography",
        description: "Clearing cache and reloading bibliography data...",
      });
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not clear browser storage. Try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-biblio-lightBlue">
      {/* Mobile header with menu button and back link */}
      <div className="bg-biblio-navy text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white hover:text-biblio-lightBlue">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold">Blake Bibliography Navigator</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-biblio-lightBlue p-2"
            onClick={() => setShowPdfUploader(!showPdfUploader)}
          >
            <BookOpen size={20} />
          </Button>
          <button 
            className="p-2 rounded-md hover:bg-sidebar-accent md:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <BibliographySidebar 
          onSelectCategory={handleSelectCategory} 
          onSelectEntry={handleSelectEntry}
          onSearch={handleSearch}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          entries={allEntries}
          chapters={chapters}
          subheadings={subheadings}
        />
        
        <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
          {storageError && (
            <Alert variant="destructive" className="mx-4 mt-4 md:mx-auto md:max-w-4xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Storage Error</AlertTitle>
              <AlertDescription>
                Your browser's storage limit has been reached or there was an error loading the bibliography. 
                Some entries couldn't be loaded.
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh Data
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {showPdfUploader && (
            <Card className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-md mt-6 mx-4 md:mx-auto">
              <h2 className="text-xl font-bold mb-4">Process Bibliography PDF</h2>
              <div className="mb-4">
                <p className="text-biblio-gray text-sm">
                  Due to browser storage limitations, only a subset of entries may be stored. 
                  If you're experiencing issues, try using a different browser or clearing browser data.
                </p>
              </div>
              <PdfUploader 
                onBibliographyExtracted={handleBibliographyExtracted}
                minEntriesThreshold={800} // Reduced threshold to match PdfExtractor
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-3 w-3" />
                  Clear & Refresh
                </Button>
              </div>
            </Card>
          )}
          
          {isLoading ? (
            <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-md my-6 mx-4 md:mx-auto flex flex-col items-center justify-center h-64">
              <Loader className="h-8 w-8 animate-spin text-biblio-navy mb-4" />
              <p className="text-biblio-navy">Loading bibliography entries...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-md my-6 mx-4 md:mx-auto">
              <BibliographyContent 
                entries={entries} 
                isLoading={isLoading} 
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedSubheading={selectedSubheading}
                onEntriesExtracted={handleBibliographyExtracted}
              />
              
              {(entries.length === 0 || allEntries.length < 100) && !isLoading && !searchQuery && (
                <div className="mt-8 text-center">
                  <p className="mb-4 text-biblio-navy">
                    {allEntries.length === 0 ? (
                      "No entries loaded yet. Please process the PDF to load bibliography entries."
                    ) : (
                      `Currently loaded ${allEntries.length} entries. Need more?`
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <Button 
                      onClick={() => setShowPdfUploader(true)}
                      className="flex items-center gap-2"
                    >
                      <BookOpen size={16} />
                      Process Bibliography PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleRefresh}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      Clear & Refresh Data
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Note: Browser storage limitations may prevent storing all entries.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bibliography;
