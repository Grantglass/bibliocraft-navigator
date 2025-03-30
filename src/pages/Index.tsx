
import React, { useState, useEffect } from 'react';
import BibliographySidebar from '@/components/BibliographySidebar';
import BibliographyContent from '@/components/BibliographyContent';
import { 
  getAllEntries, 
  searchEntries,
  BibliographyEntry,
  categorizeEntries
} from '@/data/bibliographyData';
import { Menu } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [entries, setEntries] = useState<BibliographyEntry[]>([]);
  const [allEntries, setAllEntries] = useState<BibliographyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState<string[]>([]);
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

  // Extract unique chapters from entries
  useEffect(() => {
    if (allEntries.length > 0) {
      // Only extract main chapter headings (PART I, PART II, etc.)
      const mainChapters = allEntries
        .filter(entry => entry.chapter && entry.chapter.startsWith('PART '))
        .map(entry => entry.chapter as string)
        // Remove duplicates
        .filter((chapter, index, self) => self.indexOf(chapter) === index)
        .sort();
      
      setChapters(mainChapters);
      
      // If chapters are available and no category is selected, select the first chapter
      if (mainChapters.length > 0 && !selectedCategory) {
        handleSelectCategory(mainChapters[0]);
      }
    }
  }, [allEntries, selectedCategory]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSelectCategory = (categoryId: string) => {
    setIsLoading(true);
    setSearchQuery('');
    setSelectedCategory(categoryId);
    
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
  };

  const handleSelectEntry = (entryId: string) => {
    setIsLoading(true);
    setSearchQuery('');
    
    setTimeout(() => {
      const selectedEntry = allEntries.find(entry => entry.id === entryId);
      setEntries(selectedEntry ? [selectedEntry] : []);
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

  const handleBibliographyExtracted = (extractedEntries: BibliographyEntry[]) => {
    // Categorize the entries
    const categorizedEntries = categorizeEntries(extractedEntries);
    setAllEntries(categorizedEntries);
    setEntries(categorizedEntries);
    
    toast({
      title: "Bibliography Imported",
      description: `Successfully imported ${categorizedEntries.length} entries.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-biblio-lightBlue">
      {/* Mobile header with menu button */}
      <div className="bg-biblio-navy text-white p-4 md:hidden flex items-center justify-between">
        <h1 className="text-lg font-bold">Bibliography Navigator</h1>
        <button 
          className="p-2 rounded-md hover:bg-sidebar-accent"
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
        />
        
        <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
          <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-md my-6 mx-4 md:mx-auto">
            <BibliographyContent 
              entries={entries} 
              isLoading={isLoading} 
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onEntriesExtracted={handleBibliographyExtracted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
