import React, { useState, useEffect } from 'react';
import BibliographySidebar from '@/components/BibliographySidebar';
import BibliographyContent from '@/components/BibliographyContent';
import { 
  getAllEntries, 
  searchEntries,
  BibliographyEntry,
  categorizeEntries,
  bibliographyEntries,
  bibliographySubheadings
} from '@/data/bibliographyData';
import { Menu, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

const Bibliography = () => {
  // Initialize with the pre-built data immediately
  const [entries, setEntries] = useState<BibliographyEntry[]>(bibliographyEntries);
  const [allEntries, setAllEntries] = useState<BibliographyEntry[]>(bibliographyEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubheading, setSelectedSubheading] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState<string[]>([]);
  const [subheadings, setSubheadings] = useState<Record<string, string[]>>(bibliographySubheadings);
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

  // Extract unique chapters from entries - now using pre-loaded data
  useEffect(() => {
    if (allEntries.length > 0) {
      // Extract all PART chapters (I-X)
      const partChapters = [
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
    // Only use if we don't already have entries
    if (allEntries.length === 0) {
      const categorizedEntries = categorizeEntries(extractedEntries);
      setAllEntries(categorizedEntries);
      setEntries(categorizedEntries);
      
      if (extractedSubheadings) {
        setSubheadings(extractedSubheadings);
      }
      
      toast({
        title: "Bibliography Imported",
        description: `Successfully imported ${categorizedEntries.length} entries.`,
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
          <h1 className="text-lg font-bold">Bibliography Navigator</h1>
        </div>
        <button 
          className="p-2 rounded-md hover:bg-sidebar-accent md:hidden"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>
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
          <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-md my-6 mx-4 md:mx-auto">
            <BibliographyContent 
              entries={entries} 
              isLoading={isLoading} 
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedSubheading={selectedSubheading}
              onEntriesExtracted={handleBibliographyExtracted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bibliography;
