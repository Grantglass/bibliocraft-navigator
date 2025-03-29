
import React from 'react';
import { BibliographyEntry } from '../data/bibliographyData';
import PdfUploader from './PdfUploader';

interface BibliographyContentProps {
  entries: BibliographyEntry[];
  isLoading?: boolean;
  searchQuery?: string;
  selectedCategory?: string;
  onEntriesExtracted?: (entries: BibliographyEntry[]) => void;
}

const BibliographyContent: React.FC<BibliographyContentProps> = ({ 
  entries, 
  isLoading, 
  searchQuery,
  selectedCategory,
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
    } else if (selectedCategory) {
      return selectedCategory.replace(/_/g, ' ').split(' ').map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    } else {
      return 'All Bibliography Entries';
    }
  };

  const showPdfUploader = entries.length === 0 && !searchQuery;

  return (
    <div className="bibliography-content">
      <div className="border-b border-biblio-lightGray pb-4 mb-6">
        <h1 className="text-3xl font-bold text-biblio-navy">{getPageTitle()}</h1>
        {searchQuery && entries.length === 0 && (
          <p className="text-biblio-gray mt-2">No entries found for your search.</p>
        )}
      </div>

      {showPdfUploader && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-biblio-navy mb-4">Import Bibliography from PDF</h2>
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
              <p className="mt-3 text-gray-700">{entry.content}</p>
            </div>
          ))}
        </div>
      ) : (
        !searchQuery && !showPdfUploader && (
          <div className="text-center p-8">
            <p className="text-biblio-gray">Select a category or search for entries to begin.</p>
          </div>
        )
      )}
    </div>
  );
};

export default BibliographyContent;
