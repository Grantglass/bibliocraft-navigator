
export interface BibliographyEntry {
  id: string;
  title: string;
  authors: string;
  year: string;
  publication: string;
  category: string;
  content: string;
}

export interface BibliographyCategory {
  id: string;
  name: string;
  subcategories?: BibliographyCategory[];
  entries?: string[];
}

export const bibliographyEntries: BibliographyEntry[] = [
  {
    id: "entry1",
    title: "The Evolution of Modern Bibliography Methods",
    authors: "Smith, J. & Johnson, A.",
    year: "2020",
    publication: "Journal of Library Science, 45(2), 78-92",
    category: "methodology",
    content: "This seminal paper explores the transition from traditional card catalog systems to digital bibliography management. The authors present a comprehensive analysis of the efficiency gains and accessibility improvements offered by modern digital systems while acknowledging the cultural significance of traditional methods."
  },
  {
    id: "entry2",
    title: "Digital Transformation in Academic Libraries",
    authors: "Williams, R.",
    year: "2019",
    publication: "Digital Library Quarterly, 22(1), 15-33",
    category: "digital",
    content: "Williams examines how academic libraries have implemented digital solutions to manage vast collections of references and source materials. This study includes case studies from five major university libraries and provides metrics on search time optimization and resource discovery improvements."
  },
  {
    id: "entry3",
    title: "Citation Patterns in Humanities Research",
    authors: "Garcia, M. & Patel, S.",
    year: "2021",
    publication: "Humanities Bibliography Review, 12(4), 112-128",
    category: "humanities",
    content: "This comprehensive analysis of citation patterns reveals distinct differences between humanities disciplines and STEM fields. The authors identify longer relevance periods for humanities sources and demonstrate how digital bibliography tools can be adapted to better serve humanities researchers."
  },
  {
    id: "entry4",
    title: "Metadata Standards for Digital Bibliography Systems",
    authors: "Chen, L.",
    year: "2018",
    publication: "International Journal of Information Science, 39(3), 67-83",
    category: "digital",
    content: "Chen proposes a unified metadata framework for digital bibliography systems that enhances cross-platform compatibility and search functionality. The framework incorporates elements from Dublin Core, MARC, and custom taxonomies designed specifically for academic citation systems."
  },
  {
    id: "entry5",
    title: "Historical Development of Scientific Bibliographies",
    authors: "Anderson, P.",
    year: "2017",
    publication: "Science History Studies, 28(2), 45-61",
    category: "history",
    content: "This historical survey traces the development of scientific bibliography practices from the early scientific societies to modern digital repositories. Anderson highlights key innovations in organization systems and demonstrates how classification paradigms have evolved to accommodate expanding scientific knowledge."
  },
  {
    id: "entry6",
    title: "User Experience in Bibliography Software Design",
    authors: "Kowalski, E. & Rodriguez, T.",
    year: "2020",
    publication: "Journal of Academic Technology, 15(3), 92-107",
    category: "digital",
    content: "Through usability studies with over 200 researchers, this paper identifies key design principles for bibliography management software. The authors propose a user-centered design framework that prioritizes intuitive organization, efficient search, and seamless integration with writing workflows."
  },
  {
    id: "entry7",
    title: "Traditional Bibliography Methods in East Asian Studies",
    authors: "Tanaka, H.",
    year: "2019",
    publication: "East Asian Library Journal, 42(1), 28-44",
    category: "methodology",
    content: "Tanaka examines the unique challenges and approaches in organizing East Asian bibliographic materials. The paper addresses language-specific issues, specialized classification systems, and the integration of traditional knowledge structures with modern digital bibliography standards."
  },
  {
    id: "entry8",
    title: "Open Access and Bibliography Data Sharing",
    authors: "Müller, A. & Okafor, C.",
    year: "2021",
    publication: "Open Science Journal, 8(2), 112-127",
    category: "open_access",
    content: "This analysis explores how open access principles are transforming bibliography practices. The authors examine collaborative bibliography platforms, API-enabled citation sharing, and the impact of open metadata standards on research discovery and cross-disciplinary collaboration."
  },
  {
    id: "entry9",
    title: "AI Applications in Modern Bibliography Systems",
    authors: "Patel, R. & Lee, S.",
    year: "2022",
    publication: "Artificial Intelligence in Libraries, 5(1), 33-49",
    category: "digital",
    content: "Patel and Lee demonstrate how machine learning and natural language processing are revolutionizing bibliography management. Their research showcases automated metadata extraction, intelligent citation suggestion systems, and predictive research recommendation engines based on bibliography analysis."
  },
  {
    id: "entry10",
    title: "The Social Impact of Bibliography Accessibility",
    authors: "Washington, T.",
    year: "2020",
    publication: "Social Studies of Information, 31(4), 76-92",
    category: "social",
    content: "Washington examines how improved bibliography accessibility impacts knowledge democratization and educational equity. The study presents evidence that open, user-friendly bibliography systems significantly increase research participation from underrepresented communities and non-traditional academic settings."
  }
];

export const bibliographyCategories: BibliographyCategory[] = [
  {
    id: "methodology",
    name: "Methodology & Standards",
    entries: ["entry1", "entry7"],
    subcategories: []
  },
  {
    id: "digital",
    name: "Digital Bibliography",
    entries: ["entry2", "entry4", "entry6", "entry9"],
    subcategories: []
  },
  {
    id: "humanities",
    name: "Humanities",
    entries: ["entry3"],
    subcategories: []
  },
  {
    id: "history",
    name: "Historical Studies",
    entries: ["entry5"],
    subcategories: []
  },
  {
    id: "open_access",
    name: "Open Access & Sharing",
    entries: ["entry8"],
    subcategories: []
  },
  {
    id: "social",
    name: "Social Impact",
    entries: ["entry10"],
    subcategories: []
  }
];

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
