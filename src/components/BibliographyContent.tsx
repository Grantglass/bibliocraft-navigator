
import React from 'react';
import { BibliographyEntry } from '../data/bibliographyData';

interface BibliographyContentProps {
  entries: BibliographyEntry[];
  isLoading?: boolean;
  searchQuery?: string;
  selectedCategory?: string;
}

const BibliographyContent: React.FC<BibliographyContentProps> = ({ 
  entries, 
  isLoading, 
  searchQuery,
  selectedCategory 
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

  return (
    <div className="bibliography-content">
      <div className="border-b border-biblio-lightGray pb-4 mb-6">
        <h1 className="text-3xl font-bold text-biblio-navy">{getPageTitle()}</h1>
        {searchQuery && entries.length === 0 && (
          <p className="text-biblio-gray mt-2">No entries found for your search.</p>
        )}
      </div>

      {entries.length > 0 ? (
        <div>
          {entries.map((entry) => (
            <div key={entry.id} className="bibliography-entry">
              <h2 className="text-xl font-semibold text-biblio-navy">{entry.title}</h2>
              <p className="text-biblio-darkGray">{entry.authors} ({entry.year})</p>
              <p className="text-biblio-gray italic">{entry.publication}</p>
              <p className="mt-2">{entry.content}</p>
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
