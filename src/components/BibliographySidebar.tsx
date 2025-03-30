
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Menu, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { BibliographyEntry } from '@/data/bibliographyData';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';

interface BibliographySidebarProps {
  onSelectCategory: (categoryId: string) => void;
  onSelectEntry: (entryId: string) => void;
  onSearch: (query: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  entries?: BibliographyEntry[];
  chapters?: string[];
  subheadings?: Record<string, string[]>;
}

const BibliographySidebar: React.FC<BibliographySidebarProps> = ({
  onSelectCategory,
  onSelectEntry,
  onSearch,
  isSidebarOpen,
  toggleSidebar,
  entries = [],
  chapters = [],
  subheadings = {}
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubheadings, setExpandedSubheadings] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize expanded state for chapters when they change
  useEffect(() => {
    if (chapters.length > 0) {
      const initialState = Object.fromEntries(chapters.map(chapter => [chapter, true]));
      setExpandedCategories(initialState);
      
      // Also initialize subheadings expanded state
      const initialSubheadingState: Record<string, boolean> = {};
      Object.keys(subheadings).forEach(chapter => {
        subheadings[chapter].forEach(subheading => {
          initialSubheadingState[`${chapter}:${subheading}`] = false;
        });
      });
      setExpandedSubheadings(initialSubheadingState);
    }
  }, [chapters, subheadings]);
  
  // Group entries by chapter and subheading
  const entriesByCategory = React.useMemo(() => {
    const result: Record<string, Record<string, string[]>> = {};
    
    chapters.forEach(chapter => {
      result[chapter] = { '_main': [] };
      
      // Add subheadings for this chapter
      if (subheadings[chapter]) {
        subheadings[chapter].forEach(subheading => {
          result[chapter][subheading] = [];
        });
      }
      
      // Filter entries for this chapter and assign to appropriate subheading
      const chapterEntries = entries.filter(entry => 
        entry.chapter === chapter || 
        (entry.chapter && entry.chapter.startsWith(chapter + '.'))
      );
      
      chapterEntries.forEach(entry => {
        const subheading = entry.subheading;
        
        if (subheading && result[chapter][subheading]) {
          // Entry has a subheading that exists in our structure
          result[chapter][subheading].push(entry.id);
        } else {
          // Entry has no subheading or unknown subheading - put in main chapter
          result[chapter]['_main'].push(entry.id);
        }
      });
    });
    
    return result;
  }, [entries, chapters, subheadings]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const toggleSubheading = (key: string) => {
    setExpandedSubheadings(prev => ({
      ...prev,
      [key]: !prev[key]
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
  
  // Count entries for a chapter including all its subheadings
  const getChapterEntryCount = (chapter: string) => {
    if (!entriesByCategory[chapter]) return 0;
    
    let count = entriesByCategory[chapter]['_main'].length;
    
    // Add entries from subheadings
    Object.keys(entriesByCategory[chapter]).forEach(subheading => {
      if (subheading !== '_main') {
        count += entriesByCategory[chapter][subheading].length;
      }
    });
    
    return count;
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
            {chapters.length > 0 ? (
              // Display chapters using Collapsible component
              chapters.map((chapter) => {
                const chapterEntries = getChapterEntryCount(chapter);
                const hasEntries = chapterEntries > 0;
                const isExpanded = expandedCategories[chapter] || false;
                
                return (
                  <Collapsible 
                    key={chapter} 
                    open={isExpanded} 
                    onOpenChange={() => toggleCategory(chapter)}
                    className="mb-2"
                  >
                    <div className="flex items-center p-2 rounded-md cursor-pointer hover:bg-sidebar-accent w-full text-left">
                      <CollapsibleTrigger asChild>
                        <button className="mr-2 flex items-center justify-center">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </CollapsibleTrigger>
                      
                      <div 
                        className="flex items-center flex-1"
                        onClick={() => onSelectCategory(chapter)}
                      >
                        <BookOpen size={16} className="mr-2" />
                        <span className="font-medium text-sm">{chapter}</span>
                        {hasEntries && <span className="ml-auto text-xs bg-sidebar-accent px-2 py-0.5 rounded-full">{chapterEntries}</span>}
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      {/* Main chapter entries */}
                      {entriesByCategory[chapter] && entriesByCategory[chapter]['_main'].length > 0 && (
                        <div className="ml-6 pl-2 border-l border-sidebar-border">
                          {entriesByCategory[chapter]['_main'].map((entryId) => {
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
                      
                      {/* Subheadings */}
                      {subheadings[chapter] && subheadings[chapter].map(subheading => {
                        const subheadingKey = `${chapter}:${subheading}`;
                        const isSubheadingExpanded = expandedSubheadings[subheadingKey] || false;
                        const subheadingEntries = entriesByCategory[chapter][subheading] || [];
                        
                        return (
                          <Collapsible
                            key={subheadingKey}
                            open={isSubheadingExpanded}
                            onOpenChange={() => toggleSubheading(subheadingKey)}
                            className="ml-6 pl-2 border-l border-sidebar-border"
                          >
                            <div className="flex items-center p-2 rounded-md cursor-pointer hover:bg-sidebar-accent w-full text-left">
                              <CollapsibleTrigger asChild>
                                <button className="mr-2 flex items-center justify-center">
                                  {isSubheadingExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                              </CollapsibleTrigger>
                              
                              <div 
                                className="flex items-center flex-1"
                                onClick={() => onSelectCategory(`${chapter}.${subheading}`)}
                              >
                                <FileText size={14} className="mr-2" />
                                <span className="font-medium text-xs">{subheading}</span>
                                {subheadingEntries.length > 0 && (
                                  <span className="ml-auto text-xs bg-sidebar-accent px-2 py-0.5 rounded-full">
                                    {subheadingEntries.length}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <CollapsibleContent>
                              {subheadingEntries.length > 0 && (
                                <div className="ml-6 pl-2 border-l border-sidebar-border">
                                  {subheadingEntries.map((entryId) => {
                                    const entry = entries.find(e => e.id === entryId);
                                    return (
                                      <div 
                                        key={entryId}
                                        className="p-2 text-xs cursor-pointer hover:bg-sidebar-accent rounded-md my-1"
                                        onClick={() => onSelectEntry(entryId)}
                                      >
                                        {entry ? entry.title.substring(0, 24) + (entry.title.length > 24 ? '...' : '') : entryId}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            ) : (
              <div className="p-4 text-center text-sidebar-foreground/60">
                <p>No chapters found.</p>
                <p className="text-xs mt-2">Upload a PDF to see chapters.</p>
              </div>
            )}
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
