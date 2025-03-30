
import React from 'react';
import { BibliographyEntry } from '../data/bibliographyData';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface BibliographyContentProps {
  entries: BibliographyEntry[];
  isLoading?: boolean;
  searchQuery?: string;
  selectedCategory?: string;
  selectedSubheading?: string;
  onEntriesExtracted?: (entries: BibliographyEntry[], subheadings?: Record<string, string[]>) => void;
}

const BibliographyContent: React.FC<BibliographyContentProps> = ({ 
  entries, 
  isLoading, 
  searchQuery,
  selectedCategory,
  selectedSubheading,
  onEntriesExtracted
}) => {
  // Group entries by subheading for better organization
  const entriesBySubheading = React.useMemo(() => {
    if (!selectedCategory || searchQuery) return null;

    // Special case for PART I - don't group by subheading
    if (selectedCategory === "PART I. TEACHING WILLIAM BLAKE") {
      return { "All Entries": entries };
    }

    const grouped: Record<string, BibliographyEntry[]> = {};
    
    // First sort entries
    const sortedEntries = [...entries].sort((a, b) => {
      // Sort by subheading first (if not PART I)
      if (selectedCategory !== "PART I. TEACHING WILLIAM BLAKE") {
        if (a.subheading && b.subheading) {
          if (a.subheading < b.subheading) return -1;
          if (a.subheading > b.subheading) return 1;
        } else if (a.subheading) {
          return -1;
        } else if (b.subheading) {
          return 1;
        }
      }
      
      // Then by author name
      return a.authors.localeCompare(b.authors);
    });
    
    // Group by subheading (except for PART I)
    sortedEntries.forEach(entry => {
      if (selectedCategory === "PART I. TEACHING WILLIAM BLAKE") {
        const group = "All Entries";
        if (!grouped[group]) {
          grouped[group] = [];
        }
        grouped[group].push(entry);
      } else {
        const subheading = entry.subheading || 'General';
        if (!grouped[subheading]) {
          grouped[subheading] = [];
        }
        grouped[subheading].push(entry);
      }
    });
    
    return grouped;
  }, [entries, selectedCategory, searchQuery]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-biblio-lightGray pb-4 mb-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bibliography-entry p-4 border rounded-md">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-20 w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}" (${entries.length} entries)`;
    } else if (selectedCategory === "INTRODUCTION") {
      return selectedSubheading ? `Introduction - ${selectedSubheading}` : 'Introduction';
    } else if (selectedCategory && selectedSubheading) {
      return `${selectedCategory} - ${selectedSubheading}`;
    } else if (selectedCategory) {
      // Show the full category title
      return selectedCategory;
    } else {
      return 'All Bibliography Entries';
    }
  };

  // Determine if we're displaying introduction entries
  const isIntroduction = selectedCategory === "INTRODUCTION";

  // Check if we have actual entries to display
  const hasEntries = entries && entries.length > 0;

  // Check if we're in PART I which shouldn't display subheadings
  const isPart1 = selectedCategory === "PART I. TEACHING WILLIAM BLAKE";

  return (
    <div className="bibliography-content">
      <div className="border-b border-biblio-lightGray pb-4 mb-6">
        <h1 className="text-3xl font-bold text-biblio-navy">{getPageTitle()}</h1>
        {searchQuery && entries.length === 0 && (
          <p className="text-biblio-gray mt-2">No entries found for your search.</p>
        )}
        {selectedCategory && !searchQuery && (
          <p className="text-biblio-gray mt-2">{entries.length} entries found</p>
        )}
      </div>

      {hasEntries ? (
        entriesBySubheading && !searchQuery ? (
          // Grouped display by subheading for better organization
          <div className="space-y-8">
            {Object.entries(entriesBySubheading).map(([subheading, subEntries]) => (
              <div key={subheading} className="space-y-4">
                {/* Only show subheadings if not in PART I */}
                {(subheading !== "All Entries" || isPart1) && (
                  <div className="sticky top-0 bg-white py-2 z-10">
                    {!isPart1 && (
                      <h2 className="text-xl font-semibold text-biblio-navy">{subheading}</h2>
                    )}
                    <Separator className="mt-2 mb-4" />
                  </div>
                )}
                
                {subEntries.map((entry) => (
                  <div key={entry.id} className={`bibliography-entry p-4 border rounded-md hover:shadow-md transition-shadow ${
                    isIntroduction || entry.chapter === "INTRODUCTION" 
                      ? 'border-biblio-navy bg-biblio-lightBlue/10' 
                      : 'border-biblio-lightGray'
                  }`}>
                    <h3 className="text-lg font-semibold text-biblio-navy">{entry.title}</h3>
                    <p className="text-biblio-darkGray mt-1">{entry.authors} ({entry.year})</p>
                    <p className="text-biblio-gray italic mt-1">{entry.publication}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-biblio-lightBlue/20 text-biblio-navy border-biblio-navy">
                        {entry.chapter}
                        {entry.subheading && !isPart1 && ` - ${entry.subheading}`}
                      </Badge>
                    </div>
                    <p className="mt-3 text-gray-700">{entry.content}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          // Regular flat list for search results
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className={`bibliography-entry p-4 border rounded-md hover:shadow-md transition-shadow ${
                isIntroduction || entry.chapter === "INTRODUCTION" 
                  ? 'border-biblio-navy bg-biblio-lightBlue/10' 
                  : 'border-biblio-lightGray'
              }`}>
                <h2 className="text-xl font-semibold text-biblio-navy">{entry.title}</h2>
                <p className="text-biblio-darkGray mt-1">{entry.authors} ({entry.year})</p>
                <p className="text-biblio-gray italic mt-1">{entry.publication}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-biblio-navy/10 text-biblio-navy">
                    {entry.chapter}
                  </Badge>
                  {entry.subheading && !isPart1 && (
                    <Badge variant="outline" className={`${
                      isIntroduction || entry.chapter === "INTRODUCTION"
                        ? 'bg-biblio-navy text-white' 
                        : 'bg-biblio-lightBlue text-biblio-navy'
                    }`}>
                      {entry.subheading}
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-gray-700">{entry.content}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        !searchQuery && (
          <div className="text-center p-8">
            <p className="text-biblio-gray">Select a category or search for entries to begin.</p>
          </div>
        )
      )}
    </div>
  );
};

export default BibliographyContent;
