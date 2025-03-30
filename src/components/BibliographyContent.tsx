
import React, { useEffect } from 'react';
import { BibliographyEntry, bibliographyEntries, bibliographySubheadings } from '../data/bibliographyData';
import { Skeleton } from '@/components/ui/skeleton';

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
  // Auto-load entries when the component mounts
  useEffect(() => {
    if (onEntriesExtracted) {
      // Use the pre-built data directly, no PDF loading needed
      onEntriesExtracted(bibliographyEntries, bibliographySubheadings);
    }
  }, [onEntriesExtracted]);

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

  return (
    <div className="bibliography-content">
      <div className="border-b border-biblio-lightGray pb-4 mb-6">
        <h1 className="text-3xl font-bold text-biblio-navy">{getPageTitle()}</h1>
        {searchQuery && entries.length === 0 && (
          <p className="text-biblio-gray mt-2">No entries found for your search.</p>
        )}
      </div>

      {entries.length > 0 ? (
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
              {entry.subheading && (
                <div className="mt-2 text-sm">
                  <span className={`px-2 py-1 rounded ${
                    isIntroduction || entry.chapter === "INTRODUCTION"
                      ? 'bg-biblio-navy text-white' 
                      : 'bg-biblio-lightBlue text-biblio-navy'
                  }`}>
                    {entry.subheading}
                  </span>
                </div>
              )}
              <p className="mt-3 text-gray-700">{entry.content}</p>
            </div>
          ))}
        </div>
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
