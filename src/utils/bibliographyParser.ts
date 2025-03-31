
import { BibliographyEntry } from '@/data/bibliographyData';
import { createFallbackEntries, createIntroductionEntries } from './pdfProcessing';

/**
 * Parses bibliography entries from the extracted text
 */
export const parseBibliographyEntries = (text: string): { entries: BibliographyEntry[], subheadings: Record<string, string[]> } => {
  // Initialize with empty arrays/objects to prevent undefined errors
  const entries: BibliographyEntry[] = [];
  const subheadings: Record<string, string[]> = {};
  
  const predefinedParts = [
    "INTRODUCTION",
    "PART I. TEACHING WILLIAM BLAKE",
    "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    "PART III. EDITIONS OF BLAKE'S WRITING",
    "PART IV. BIOGRAPHIES",
    "PART V. BIBLIOGRAPHIES",
    "PART VI. CATALOGUES",
    "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    "PART VIII. SPECIFIC WORKS BY BLAKE",
    "PART IX. COLLECTIONS OF ESSAYS ON BLAKE PUBLISHED",
    "PART X. APPENDICES"
  ];
  
  // Initialize each part with an empty array to prevent undefined errors
  predefinedParts.forEach(part => {
    subheadings[part] = [];
  });
  
  // Add Introduction subheadings
  subheadings["INTRODUCTION"] = ["Prefatory Material", "Table of Contents", "Guidelines", "Digital Resources", "Citations, Annotations, and Links", "Different Blake Journals"];
  
  // Improved subheading extraction
  const subheadingRegex = /(?:^|\n)([A-Z][A-Za-z\s,]+)(?:\s+\d+)?(?:\n|\r)/g;
  
  // Split the text by part markers for better organization
  const partMarkerRegex = /(PART [IVX]+\.\s+[A-Z\s]+)/g;
  const parts = text.split(partMarkerRegex);
  
  // Improved entry extraction - looking for bibliographic entries
  // Looking for patterns like "Author Name. Title. Publication details, Year."
  const entryRegexList = [
    // Match author year pattern (Author, Year. Title...)
    /([A-Z][a-z]+(?:,?\s+[A-Z]\.(?:\s*[A-Z]\.)*|\s+[A-Z][a-z]+)(?:,\s|\sand\s|,\sand\s|\s&\s)[A-Za-z\s,\.]+)(?:\.\s+|\s+)[""]?([^""\.\n]+)[""]?\.([^\.]+\d{4}[^\.]*\.)/g,
    
    // Match entry starting with a title in quotes
    /[""]([^""]+)[""]\.([^\.]+)(?:\.\s+|\s+)(\d{4})/g,
    
    // Find entries with citation markers like <BBS 123>
    /([^\n<.]+)\s*<([A-Z]+\s*[^>]+)>([^\n<]+)/g,
    
    // Find entries that start with an author's last name and year
    /([A-Z][a-z]+)(?:,\s|\s)([A-Za-z\s,\.]+)(?:\.\s+|\s+)(\d{4})/g
  ];
  
  // Process each part/section
  for (let i = 0; i < parts.length; i++) {
    const section = parts[i];
    
    // Skip short sections
    if (section.length < 100) continue;
    
    // Find if this section is a header (PART X...)
    const partMatch = section.match(/PART [IVX]+\.\s+[A-Z\s]+/);
    if (partMatch) {
      const partTitle = partMatch[0].trim();
      const matchedPredefinedPart = predefinedParts.find(part => part.includes(partTitle));
      
      if (matchedPredefinedPart) {
        // Extract subheadings for this part
        let subheadingMatch;
        let localSubheadingRegex = /(?:^|\n)([A-Z][A-Za-z\s,]+)(?:\s+\d+)?(?:\n|\r)/g;
        while ((subheadingMatch = localSubheadingRegex.exec(section)) !== null) {
          const potentialSubheading = subheadingMatch[1].trim();
          
          if (potentialSubheading.length > 4 && 
              !potentialSubheading.includes("PART") && 
              !potentialSubheading.includes("APPENDIX") &&
              !potentialSubheading.match(/^[IVX]+$/) &&
              !potentialSubheading.match(/^\d+$/) &&
              potentialSubheading.split(" ").length <= 8) {
            
            if (!subheadings[matchedPredefinedPart].includes(potentialSubheading)) {
              subheadings[matchedPredefinedPart].push(potentialSubheading);
            }
          }
        }
      }
      continue;
    }
    
    // Extract entries from this section
    // Find which part this section belongs to
    let sectionPart = "PART I. TEACHING WILLIAM BLAKE"; // Default
    
    for (const part of predefinedParts) {
      if (section.includes(part) || (i > 0 && parts[i-1].includes(part))) {
        sectionPart = part;
        break;
      }
    }
    
    // Determine subheading based on content
    let sectionSubheading = subheadings[sectionPart][0] || "General";
    
    // Look for common subheading markers
    const subheadingOptions = subheadings[sectionPart] || [];
    for (const subheading of subheadingOptions) {
      if (section.includes(subheading)) {
        sectionSubheading = subheading;
        break;
      }
    }
    
    // Try different regex patterns to extract entries
    for (const regex of entryRegexList) {
      let match;
      let localRegex = new RegExp(regex); // Create a new instance to reset lastIndex
      
      while ((match = localRegex.exec(section)) !== null) {
        // Extract entry components based on the pattern that matched
        let author = "";
        let title = "";
        let publication = "";
        let year = "";
        let content = "";
        
        if (match[0].includes("<")) {
          // Citation pattern
          author = match[1]?.trim() || "Unknown";
          title = match[3]?.trim() || "Unknown";
          publication = match[2]?.trim() || "";
          
          // Try to extract year
          const yearMatch = match[0].match(/\b(19|20)\d{2}\b/);
          year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
          
          // Collect content - the paragraph following this entry
          const contentStart = match.index + match[0].length;
          const nextParagraph = section.substring(contentStart, contentStart + 500).split(/\n\n|\r\n\r\n/)[0];
          content = nextParagraph.trim();
        } else if (match[0].includes('"') || match[0].includes('"')) {
          // Title in quotes pattern
          title = match[1]?.trim() || "Unknown";
          author = match[2]?.trim() || "Unknown Author";
          publication = match[3]?.trim() || "";
          
          // Try to extract year
          const yearMatch = match[0].match(/\b(19|20)\d{2}\b/);
          year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
          
          // Collect content
          const contentStart = match.index + match[0].length;
          const nextParagraph = section.substring(contentStart, contentStart + 500).split(/\n\n|\r\n\r\n/)[0];
          content = nextParagraph.trim();
        } else {
          // Author year pattern
          author = match[1]?.trim() || "Unknown";
          if (match[2]) {
            title = match[2]?.trim() || "Unknown";
          } else {
            title = "Unknown";
          }
          
          // Try to extract publication and year
          if (match[3]) {
            publication = match[3]?.trim() || "";
            const yearMatch = match[3].match(/\b(19|20)\d{2}\b/);
            year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
          } else {
            year = new Date().getFullYear().toString();
          }
          
          // Collect content
          const contentStart = match.index + match[0].length;
          const nextParagraph = section.substring(contentStart, contentStart + 500).split(/\n\n|\r\n\r\n/)[0];
          content = nextParagraph.trim();
        }
        
        // Clean up extracted text - fixed regex to properly handle quotes
        title = title.replace(/[""""""]/g, '').trim();
        author = author.replace(/\.$/, '').trim();
        
        // Create a unique ID
        const id = `pdf_${entries.length + 1}_${author.substring(0, 10).replace(/\s/g, '_').toLowerCase()}`;
        
        // Only add if we have at least a title and either author or content
        if (title && (author || content)) {
          entries.push({
            id,
            title,
            authors: author,
            year,
            publication,
            content: content || match[0], // Use match text as fallback content
            category: 'humanities',
            chapter: sectionPart,
            subheading: sectionSubheading
          });
        }
      }
    }
  }
  
  // Add known subheadings for each PART
  const knownSubheadings: Record<string, string[]> = {
    "PART I. TEACHING WILLIAM BLAKE": [
      "Citations, Annotations, and Links",
      "A Note on Specialized Terms for Researchers New to William Blake",
      "Different Blake Journals"
    ],
    "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES": [
      "General Introductions, Handbooks, and Glossaries",
      "Classic Studies Published Before 2000"
    ],
    "PART III. EDITIONS OF BLAKE'S WRITING": [
      "Standard Editions",
      "Annotated Editions of Collected or Selected Writings",
      "Facsimiles and Reproductions of the Illuminated Books",
      "Digital Editions"
    ],
    "PART IV. BIOGRAPHIES": [
      "Brief Introductions",
      "Portraits",
      "Standard Biographies",
      "Books, Chapters, and Articles with Substantial Biographical Information",
      "Historic Biographies",
      "Popular Biographies",
      "Catherine Blake",
      "On Writing Blake's Biography",
      "Blake and Members of His Circle"
    ],
    "PART V. BIBLIOGRAPHIES": [
      "Standard Bibliographies",
      "Books and Essays with Substantial Bibliographic Content",
      "Bibliographies of Exhibitions",
      "Bibliographies of Musical Settings",
      "Annotated Bibliographies",
      "Historic Bibliographies"
    ],
    "PART VI. CATALOGUES": [
      "Standard Catalogues",
      "Historic Standard Catalogues",
      "Current Collections: Digital Collections, Collection Catalogues",
      "Major Exhibition and Sale Catalogues"
    ],
    "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT": [
      "Bible and Religion",
      "History and Politics",
      "Philosophy",
      "Science and Medicine",
      "Aesthetics",
      "Gender and Sexuality",
      "Race and Empire",
      "Art Criticism and Art History",
      "Literary Criticism and Poetics",
      "Myth and Symbolism"
    ],
    "PART VIII. SPECIFIC WORKS BY BLAKE": [
      "Songs of Innocence and of Experience",
      "The Marriage of Heaven and Hell",
      "The Four Zoas",
      "Milton",
      "Jerusalem"
    ]
  };
  
  // Merge in the known subheadings
  Object.keys(knownSubheadings).forEach(part => {
    if (subheadings[part]) {
      knownSubheadings[part].forEach(subheading => {
        if (!subheadings[part].includes(subheading)) {
          subheadings[part].push(subheading);
        }
      });
    } else {
      subheadings[part] = [...knownSubheadings[part]];
    }
  });
  
  // If we don't have enough entries, use our prebuilt data
  if (entries.length < 50) {
    return { entries: createFallbackEntries(), subheadings };
  }
  
  return { entries, subheadings };
};
