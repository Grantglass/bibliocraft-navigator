
import prebuiltData from './prebuiltBibliographyData.json';

export interface BibliographyEntry {
  id: string;
  title: string;
  authors: string;
  year: string;
  publication: string;
  content: string;
  category: string;
  chapter?: string;
  subheading?: string;
}

export interface BibliographyCategory {
  id: string;
  name: string;
  subcategories?: BibliographyCategory[];
  entries?: string[];
}

// Use the pre-built data
export const bibliographyEntries: BibliographyEntry[] = prebuiltData.entries;

// Convert the JSON subheadings to the correct type
export const bibliographySubheadings: Record<string, string[]> = prebuiltData.subheadings;

// Fix the subheadings for PART I
if (bibliographySubheadings["PART I. TEACHING WILLIAM BLAKE"]) {
  // Remove subheadings for PART I as requested
  delete bibliographySubheadings["PART I. TEACHING WILLIAM BLAKE"];
}

// Make sure INTRODUCTION has these specific subheadings
bibliographySubheadings["INTRODUCTION"] = [
  "Prefatory Material",
  "Table of Contents",
  "Guidelines",
  "Digital Resources",
  "Citations, Annotations, and Links",
  "Different Blake Journals"
];

export const bibliographyCategories: BibliographyCategory[] = [
  {
    id: "methodology",
    name: "Methodology & Standards",
    entries: [],
    subcategories: []
  },
  {
    id: "digital",
    name: "Digital Bibliography",
    entries: [],
    subcategories: []
  },
  {
    id: "humanities",
    name: "Humanities",
    entries: [],
    subcategories: []
  },
  {
    id: "history",
    name: "Historical Studies",
    entries: [],
    subcategories: []
  },
  {
    id: "open_access",
    name: "Open Access & Sharing",
    entries: [],
    subcategories: []
  },
  {
    id: "social",
    name: "Social Impact",
    entries: [],
    subcategories: []
  }
];

export const getEntriesByChapterAndSubheading = (
  chapter: string, 
  subheading?: string, 
  entries: BibliographyEntry[] = bibliographyEntries
): BibliographyEntry[] => {
  if (subheading) {
    return entries.filter(entry => 
      entry.chapter === chapter && entry.subheading === subheading
    );
  }
  return entries.filter(entry => entry.chapter === chapter);
};

export const getAllEntries = (): BibliographyEntry[] => {
  return bibliographyEntries;
};

export const getEntriesByCategory = (categoryId: string, entries: BibliographyEntry[] = bibliographyEntries): BibliographyEntry[] => {
  const category = bibliographyCategories.find(cat => cat.id === categoryId);
  if (!category || !category.entries) return [];
  
  return category.entries.map(entryId => 
    entries.find(entry => entry.id === entryId)
  ).filter((entry): entry is BibliographyEntry => entry !== undefined);
};

export const getEntryById = (entryId: string, entries: BibliographyEntry[] = bibliographyEntries): BibliographyEntry | undefined => {
  return entries.find(entry => entry.id === entryId);
};

export const searchEntries = (query: string, entries: BibliographyEntry[] = bibliographyEntries): BibliographyEntry[] => {
  const lowercaseQuery = query.toLowerCase();
  return entries.filter(entry => 
    entry.title.toLowerCase().includes(lowercaseQuery) ||
    entry.authors.toLowerCase().includes(lowercaseQuery) ||
    entry.content.toLowerCase().includes(lowercaseQuery)
  );
};

// Add the missing categorizeEntries function
export const categorizeEntries = (entries: BibliographyEntry[]): BibliographyEntry[] => {
  return entries.map(entry => {
    // Simple categorization logic based on content keywords
    // This is a basic implementation - you may want to implement more sophisticated logic
    let category = 'academic_papers'; // Default category
    
    const contentLower = entry.content.toLowerCase();
    const titleLower = entry.title.toLowerCase();
    
    if (contentLower.includes('methodology') || titleLower.includes('methodology') || 
        contentLower.includes('standard') || titleLower.includes('standard')) {
      category = 'methodology';
    } else if (contentLower.includes('digital') || titleLower.includes('digital') ||
               contentLower.includes('software') || titleLower.includes('software') ||
               contentLower.includes('technology') || titleLower.includes('technology') ||
               contentLower.includes('ai') || titleLower.includes('ai')) {
      category = 'digital';
    } else if (contentLower.includes('humanities') || titleLower.includes('humanities')) {
      category = 'humanities';
    } else if (contentLower.includes('history') || titleLower.includes('history') ||
               contentLower.includes('historical') || titleLower.includes('historical')) {
      category = 'history';
    } else if (contentLower.includes('open access') || titleLower.includes('open access') ||
               contentLower.includes('sharing') || titleLower.includes('sharing')) {
      category = 'open_access';
    } else if (contentLower.includes('social') || titleLower.includes('social') ||
               contentLower.includes('society') || titleLower.includes('society')) {
      category = 'social';
    }
    
    return {
      ...entry,
      category
    };
  });
};
