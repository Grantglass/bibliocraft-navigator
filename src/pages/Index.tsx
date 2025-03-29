
import React, { useState, useEffect } from 'react';
import BibliographySidebar from '@/components/BibliographySidebar';
import BibliographyContent from '@/components/BibliographyContent';
import { 
  getAllEntries, 
  getEntriesByCategory, 
  getEntryById,
  searchEntries,
  BibliographyEntry,
  bibliographyCategories,
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSelectCategory = (categoryId: string) => {
    setIsLoading(true);
    setSearchQuery('');
    setSelectedCategory(categoryId);
    
    setTimeout(() => {
      const categoryEntries = getEntriesByCategory(categoryId, allEntries);
      setEntries(categoryEntries);
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
    setSelectedCategory('');
    
    setTimeout(() => {
      const entry = getEntryById(entryId, allEntries);
      setEntries(entry ? [entry] : []);
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

  const getCategoryName = (categoryId: string) => {
    const category = bibliographyCategories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
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
        />
        
        <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
          <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-md my-6 mx-4 md:mx-auto">
            <BibliographyContent 
              entries={entries} 
              isLoading={isLoading} 
              searchQuery={searchQuery}
              selectedCategory={getCategoryName(selectedCategory)}
              onEntriesExtracted={handleBibliographyExtracted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
