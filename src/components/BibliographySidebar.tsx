
import React, { useState, useEffect } from 'react';
import { bibliographyCategories } from '../data/bibliographyData';
import { ChevronDown, ChevronRight, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { BibliographyEntry } from '@/data/bibliographyData';

interface BibliographySidebarProps {
  onSelectCategory: (categoryId: string) => void;
  onSelectEntry: (entryId: string) => void;
  onSearch: (query: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  entries?: BibliographyEntry[];
}

const BibliographySidebar: React.FC<BibliographySidebarProps> = ({
  onSelectCategory,
  onSelectEntry,
  onSearch,
  isSidebarOpen,
  toggleSidebar,
  entries = []
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(bibliographyCategories.map(cat => [cat.id, true]))
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group entries by category
  const entriesByCategory = React.useMemo(() => {
    const result: Record<string, string[]> = {};
    
    bibliographyCategories.forEach(category => {
      result[category.id] = entries
        .filter(entry => entry.category === category.id)
        .map(entry => entry.id);
    });
    
    return result;
  }, [entries]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 z-40 h-screen transition-transform bg-biblio-navy text-white",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      "md:translate-x-0 md:w-64 md:relative"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-xl font-bold">Bibliography</h2>
          <button 
            className="p-2 rounded-md hover:bg-sidebar-accent md:hidden" 
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search entries..."
              className="pl-10 bg-sidebar-accent text-white border-sidebar-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground/60" 
              size={16} 
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              onClick={handleSearch}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow">
          <div className="p-2">
            {bibliographyCategories.map((category) => {
              const categoryEntries = entriesByCategory[category.id] || [];
              const hasEntries = categoryEntries.length > 0;
              
              return (
                <div key={category.id} className="mb-2">
                  <div 
                    className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-sidebar-accent ${!hasEntries ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!hasEntries) return;
                      toggleCategory(category.id);
                      onSelectCategory(category.id);
                    }}
                  >
                    <span className="mr-2">
                      {expandedCategories[category.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span className="font-medium">{category.name}</span>
                    {hasEntries && <span className="ml-auto text-xs bg-sidebar-accent px-2 py-0.5 rounded-full">{categoryEntries.length}</span>}
                  </div>
                  
                  {expandedCategories[category.id] && hasEntries && (
                    <div className="ml-6 pl-2 border-l border-sidebar-border">
                      {categoryEntries.map((entryId) => {
                        const entry = entries.find(e => e.id === entryId);
                        return (
                          <div 
                            key={entryId}
                            className="p-2 text-sm cursor-pointer hover:bg-sidebar-accent rounded-md my-1"
                            onClick={() => onSelectEntry(entryId)}
                          >
                            {entry ? entry.title.substring(0, 28) + (entry.title.length > 28 ? '...' : '') : entryId}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
          <p>© 2023 Bibliography Navigator</p>
        </div>
      </div>
    </div>
  );
};

export default BibliographySidebar;
