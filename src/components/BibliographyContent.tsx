
import React from 'react';
import { BibliographyEntry } from '../data/bibliographyData';
import PdfUploader from './PdfUploader';

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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-biblio-navy"></div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}" (${entries.length} entries)`;
    } else if (selectedCategory && selectedSubheading) {
      return `${selectedCategory} - ${selectedSubheading}`;
    } else if (selectedCategory) {
      // Show the full category title
      return selectedCategory;
    } else {
      return 'All Bibliography Entries';
    }
  };

  // Show the PDF loader when there are no entries and not searching
  const showPdfLoader = entries.length === 0 && !searchQuery;

  return (
    <div className="bibliography-content">
      <div className="border-b border-biblio-lightGray pb-4 mb-6">
        <h1 className="text-3xl font-bold text-biblio-navy">{getPageTitle()}</h1>
        {searchQuery && entries.length === 0 && (
          <p className="text-biblio-gray mt-2">No entries found for your search.</p>
        )}
      </div>

      {showPdfLoader && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-biblio-navy mb-4">Load Bibliography Data</h2>
          <PdfUploader onBibliographyExtracted={onEntriesExtracted || (() => {})} />
        </div>
      )}

      {entries.length > 0 ? (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bibliography-entry p-4 border border-biblio-lightGray rounded-md hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-biblio-navy">{entry.title}</h2>
              <p className="text-biblio-darkGray mt-1">{entry.authors} ({entry.year})</p>
              <p className="text-biblio-gray italic mt-1">{entry.publication}</p>
              {entry.subheading && (
                <div className="mt-2 text-sm">
                  <span className="bg-biblio-lightBlue text-biblio-navy px-2 py-1 rounded">
                    {entry.subheading}
                  </span>
                </div>
              )}
              <p className="mt-3 text-gray-700">{entry.content}</p>
            </div>
          ))}
        </div>
      ) : (
        !searchQuery && !showPdfLoader && (
          <div className="text-center p-8">
            <p className="text-biblio-gray">Select a category or search for entries to begin.</p>
          </div>
        )
      )}
    </div>
  );
};

export default BibliographyContent;
