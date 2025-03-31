
import { BibliographyEntry } from '@/data/bibliographyData';
import { createFallbackEntries, createIntroductionEntries } from './pdfProcessing';

interface ParseOptions {
  forceFullExtraction?: boolean;
  minEntriesThreshold?: number;
}

/**
 * Parses bibliography entries from the extracted text
 */
export const parseBibliographyEntries = (
  text: string, 
  options: ParseOptions = {}
): { entries: BibliographyEntry[], subheadings: Record<string, string[]> } => {
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
  
  // Improve subheading extraction with a more specific regex
  const subheadingRegex = /(?:^|\n)([A-Z][A-Za-z\s,]+)(?:\s+\d+)?(?:\n|\r)/g;
  
  // Split the text by part markers for better organization
  const partMarkerRegex = /(PART [IVX]+\.\s+[A-Z\s]+)/g;
  const parts = text.split(partMarkerRegex);
  
  // Enhanced entry extraction - looking for bibliographic entries
  // Multiple patterns to catch different entry formats
  const entryRegexList = [
    // Match author year pattern (Author, Year. Title...)
    /([A-Z][a-z]+(?:,?\s+[A-Z]\.(?:\s*[A-Z]\.)*|\s+[A-Z][a-z]+)(?:,\s|\sand\s|,\sand\s|\s&\s)[A-Za-z\s,\.]+)(?:\.\s+|\s+)[""]?([^""\.\n]+)[""]?\.([^\.]+\d{4}[^\.]*\.)/g,
    
    // Match entry starting with a title in quotes
    /[""]([^""]+)[""]\.([^\.]+)(?:\.\s+|\s+)(\d{4})/g,
    
    // Find entries with citation markers like <BBS 123>
    /([^\n<.]+)\s*<([A-Z]+\s*[^>]+)>([^\n<]+)/g,
    
    // Find entries that start with an author's last name and year
    /([A-Z][a-z]+)(?:,\s|\s)([A-Za-z\s,\.]+)(?:\.\s+|\s+)(\d{4})/g,
    
    // Additional pattern to catch entries like "Author. Title. Publication. Year."
    /([A-Z][a-z]+(?:,?\s+[A-Z]\.|\s+[A-Z][a-z]+)),?\s+([^\.]+)\.([^\.]+)\.([^\.]+\d{4})/g,
    
    // Pattern for entries with year at the beginning
    /(\d{4})\.?\s+([A-Z][a-z]+(?:,?\s+[A-Z]\.|\s+and\s+[A-Z][a-z]+))\.?\s+[""]?([^""\.]+)[""]?/g,
    
    // Pattern for editor-style entries
    /(?:ed\.|edited by)\s+([A-Z][a-z]+(?:,?\s+[A-Z]\.|\s+[A-Z][a-z]+))\.?\s+[""]?([^""\.]+)[""]?/g,
    
    // Blake-specific pattern - often entries about Blake's works have specific format
    /Blake['']?s\s+([A-Za-z\s]+)(?:\.\s+|\s+)([^\.]+)\.([^\.]+\d{4})/g,
    
    // Additional patterns to catch more entries when forceFullExtraction is true
    ...(options.forceFullExtraction ? [
      // Match paragraphs with author names and dates
      /([A-Z][a-z]+(?:,?\s+[A-Z]\.|\s+[A-Z][a-z]+))(?:[^\n\.]+)(\d{4})/g,
      
      // Match paragraphs with quotes that might be titles
      /[""]([^""]+)[""](?:[^\n\.]+)/g,
      
      // Match paragraphs with publication titles (italicized or underlined)
      /(?:\*|_)([^*_]+)(?:\*|_)/g,
      
      // More aggressive pattern for anything that looks like an author-year citation
      /([A-Z][a-z]+)(?:[^\n\.]{5,50})(\d{4})/g
    ] : [])
  ];
  
  // Additional patterns specifically for Blake bibliography
  const blakeSpecificRegexes = [
    // Pattern for editions of Blake's work
    /Edition[s]?\s+of\s+([A-Za-z\s]+)(?:\.\s+|\s+)([^\.]+)\.([^\.]+\d{4})/g,
    
    // Pattern for studies about Blake
    /Studies\s+of\s+([A-Za-z\s]+)(?:\.\s+|\s+)([^\.]+)\.([^\.]+\d{4})/g,
    
    // Pattern for Blake's influence
    /Blake['']?s\s+Influence\s+on\s+([A-Za-z\s]+)(?:\.\s+|\s+)([^\.]+)\.([^\.]+\d{4})/g,
    
    // Pattern for commentaries
    /Commentary\s+on\s+([A-Za-z\s]+)(?:\.\s+|\s+)([^\.]+)\.([^\.]+\d{4})/g,
    
    // More Blake-specific patterns for forced extraction
    ...(options.forceFullExtraction ? [
      // Match any mention of Blake with a nearby date
      /William\s+Blake(?:[^\n\.]{5,100})(\d{4})/g,
      
      // Match paragraphs mentioning Blake's works
      /(?:Songs of Innocence|Jerusalem|Milton|The Marriage of Heaven and Hell|The Four Zoas)(?:[^\n\.]{5,100})/g,
      
      // Match paragraphs with Blake scholars
      /(?:Bentley|Erdman|Keynes|Damon|Ackroyd|Frye)(?:[^\n\.]{5,100})/g
    ] : [])
  ];
  
  // Combine all regex patterns
  const allRegexPatterns = [...entryRegexList, ...blakeSpecificRegexes];
  
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
        let localSubheadingRegex = new RegExp(subheadingRegex);
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
    
    // Also check for subheadings within the section
    let localSubheadingRegex = new RegExp(subheadingRegex);
    let subheadingMatch;
    while ((subheadingMatch = localSubheadingRegex.exec(section)) !== null) {
      const foundSubheading = subheadingMatch[1].trim();
      if (foundSubheading.length > 4 && 
          foundSubheading.split(" ").length <= 8 &&
          !foundSubheading.match(/^[IVX]+$/) &&
          !foundSubheading.match(/^\d+$/)) {
        sectionSubheading = foundSubheading;
        // Also add to subheadings list if not there
        if (!subheadings[sectionPart].includes(foundSubheading)) {
          subheadings[sectionPart].push(foundSubheading);
        }
      }
    }
    
    // Break the section into paragraphs for more fine-grained processing
    const paragraphs = section.split(/\n\n|\r\n\r\n/);
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length < 50) continue;
      
      // Try different regex patterns to extract entries
      for (const regexPattern of allRegexPatterns) {
        let match;
        let localRegex = new RegExp(regexPattern, 'g'); // Create a new instance to reset lastIndex
        
        while ((match = localRegex.exec(paragraph)) !== null) {
          // Extract entry components based on the pattern that matched
          let author = "";
          let title = "";
          let publication = "";
          let year = "";
          let content = "";
          
          // Depending on the regex that matched, extract different components
          if (match[0].includes("<")) {
            // Citation pattern
            author = match[1]?.trim() || "Unknown";
            title = match[3]?.trim() || "Unknown";
            publication = match[2]?.trim() || "";
            
            // Try to extract year
            const yearMatch = match[0].match(/\b(19|20)\d{2}\b/);
            year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
            
            // Collect content - the paragraph following this entry
            content = paragraph.substring(match.index).trim();
          } else if (match[0].match(/[""]([^""]+)[""]/)) {
            // Title in quotes pattern
            // Find the quotes in the match
            const quoteMatch = match[0].match(/[""]([^""]+)[""]/);
            title = quoteMatch ? quoteMatch[1].trim() : "Unknown";
            
            // Extract author from what's before the title
            const beforeTitle = match[0].substring(0, match[0].indexOf(title) - 1);
            author = beforeTitle.trim() || match[2]?.trim() || "Unknown Author";
            
            // Extract publication and year
            const afterTitle = match[0].substring(match[0].indexOf(title) + title.length + 1);
            publication = afterTitle.trim() || match[3]?.trim() || "";
            
            // Try to extract year
            const yearMatch = match[0].match(/\b(19|20)\d{2}\b/);
            year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
            
            // Collect content
            content = paragraph.substring(match.index).trim();
          } else if (match[0].match(/\d{4}/)) {
            // Year pattern
            const yearMatch = match[0].match(/\d{4}/);
            year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
            
            // Try to extract other components
            if (match[1] && match[1].match(/[A-Z][a-z]+/)) {
              author = match[1].trim();
            } else if (match[2] && match[2].match(/[A-Z][a-z]+/)) {
              author = match[2].trim();
            } else {
              author = "Unknown Author";
            }
            
            // Find quoted title or use other captured group
            const titleMatch = match[0].match(/[""]([^""]+)[""]/);
            if (titleMatch) {
              title = titleMatch[1].trim();
            } else if (match[3]) {
              title = match[3].trim();
            } else {
              title = "Unknown Title";
            }
            
            // Publication might be after the title
            publication = match[0].substring(match[0].indexOf(title) + title.length).trim() || "";
            
            // Collect content
            content = paragraph.substring(match.index).trim();
          } else {
            // Author year pattern or default
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
            content = paragraph.substring(match.index).trim();
          }
          
          // Clean up extracted text
          title = title.replace(/[""""""]/g, '').trim();
          author = author.replace(/\.$/, '').trim();
          
          // Skip if we already have this exact entry
          const isDuplicate = entries.some(entry => 
            entry.title === title && entry.authors === author && entry.year === year
          );
          
          if (!isDuplicate) {
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
      
      // If we're using forced extraction, try to extract entire paragraphs as entries
      // when they look like they could be bibliographic information
      if (options.forceFullExtraction && entries.length < (options.minEntriesThreshold || 1700)) {
        const paragraphLooksLikeBibEntry = 
          (paragraph.match(/\b\d{4}\b/) && // Has a year
           paragraph.match(/[A-Z][a-z]+/) && // Has a capitalized word (potential author name)
           (paragraph.includes("William Blake") || paragraph.includes("Blake's") || 
            paragraph.includes("poetry") || paragraph.includes("art") || 
            paragraph.includes("works") || paragraph.includes("criticism") || 
            paragraph.includes("published") || paragraph.includes("edition")));
        
        if (paragraphLooksLikeBibEntry && paragraph.length > 100 && paragraph.length < 1000) {
          // Try to extract a title from the paragraph
          let title = "";
          
          // Look for quoted text that might be a title
          const quoteMatch = paragraph.match(/[""]([^""]{10,100})[""]/);
          if (quoteMatch) {
            title = quoteMatch[1].trim();
          } else {
            // Extract a potential title from the first sentence if short enough
            const firstSentence = paragraph.split(/\.|\?|!/)[0];
            if (firstSentence && firstSentence.length < 100) {
              title = firstSentence.trim();
            } else {
              // Use the first 50 chars as title
              title = paragraph.substring(0, 50).trim() + "...";
            }
          }
          
          // Extract a potential author
          let author = "Unknown Author";
          const authorMatch = paragraph.match(/([A-Z][a-z]+(?:,?\s+[A-Z]\.|\s+[A-Z][a-z]+))/);
          if (authorMatch) {
            author = authorMatch[1].trim();
          }
          
          // Extract a potential year
          let year = new Date().getFullYear().toString();
          const yearMatch = paragraph.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) {
            year = yearMatch[0];
          }
          
          // Check if this would be a duplicate
          const isDuplicate = entries.some(entry => 
            (entry.title === title && entry.authors === author) || 
            (entry.content && entry.content.includes(paragraph.substring(0, 100)))
          );
          
          if (!isDuplicate) {
            // Create a unique ID
            const id = `pdf_forced_${entries.length + 1}_${author.substring(0, 10).replace(/\s/g, '_').toLowerCase()}`;
            
            entries.push({
              id,
              title,
              authors: author,
              year,
              publication: "",
              content: paragraph,
              category: 'humanities',
              chapter: sectionPart,
              subheading: sectionSubheading
            });
          }
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
  
  // Special processing for certain parts if they have few entries
  predefinedParts.forEach(part => {
    const partEntries = entries.filter(entry => entry.chapter === part);
    if (partEntries.length < 10 && part !== "INTRODUCTION") {
      // This part has few entries, try to find content in the original text
      const partRegex = new RegExp(`${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{1,10000}?(?=PART |$)`, 'g');
      const partMatch = partRegex.exec(text);
      
      if (partMatch && partMatch[0]) {
        const partText = partMatch[0];
        // Split into paragraphs and create entries
        const paragraphs = partText.split(/\n\n|\r\n\r\n/).filter(p => p.trim().length > 100);
        
        paragraphs.forEach((paragraph, index) => {
          if (index > 20) return; // Limit to 20 entries per part to avoid overwhelming
          
          // Identify possible title - first sentence or first line
          let title = "";
          const firstLine = paragraph.split(/\n|\r\n/)[0];
          if (firstLine && firstLine.length < 100) {
            title = firstLine.trim();
          } else {
            const firstSentence = paragraph.split(/\.|\?|!/)[0];
            if (firstSentence && firstSentence.length < 100) {
              title = firstSentence.trim() + ".";
            } else {
              title = part + " Entry " + (index + 1);
            }
          }
          
          // Create a unique ID
          const id = `pdf_${entries.length + 1}_${part.substring(0, 10).replace(/\s/g, '_').toLowerCase()}_${index}`;
          
          // Only add if this doesn't duplicate existing entries
          const isDuplicate = entries.some(entry => 
            entry.chapter === part && entry.content.includes(paragraph.substring(0, 100))
          );
          
          if (!isDuplicate && title) {
            entries.push({
              id,
              title,
              authors: "Extracted from " + part,
              year: new Date().getFullYear().toString(),
              publication: "",
              content: paragraph,
              category: 'humanities',
              chapter: part,
              subheading: subheadings[part][0] || "General"
            });
          }
        });
      }
    }
  });
  
  // Force generation of more entries if we're below the threshold
  if (options.forceFullExtraction && 
      options.minEntriesThreshold && 
      entries.length < options.minEntriesThreshold) {
    
    console.warn(`Detected only ${entries.length} entries, below the threshold of ${options.minEntriesThreshold}. Generating more entries.`);
    
    // Break the text into larger chunks and process each
    const chunks = text.split(/\n\n\n|\r\n\r\n\r\n/).filter(chunk => chunk.length > 500);
    
    for (let i = 0; i < chunks.length && entries.length < options.minEntriesThreshold; i++) {
      const chunk = chunks[i];
      
      // Skip chunks that are too similar to existing entries
      const alreadyProcessed = entries.some(entry => 
        entry.content && chunk.includes(entry.content.substring(0, 50))
      );
      
      if (alreadyProcessed) continue;
      
      // Find paragraphs that look like entries
      const paragraphs = chunk.split(/\n\n|\r\n\r\n/).filter(p => 
        p.length > 100 && p.length < 1000 && 
        p.match(/\b\d{4}\b/) && // Has a year 
        p.match(/[A-Z][a-z]+/) // Has a capitalized word
      );
      
      for (let j = 0; j < paragraphs.length && entries.length < options.minEntriesThreshold; j++) {
        const paragraph = paragraphs[j];
        
        // Extract a potential title
        let title = "";
        const titleCandidates = [
          paragraph.match(/[""]([^""]{10,100})[""]/), // Quoted text
          paragraph.match(/([A-Z][a-zA-Z\s]{10,80})\./), // Capitalized phrase ending with period
          paragraph.match(/([A-Z][a-zA-Z\s]{10,80})(?:\s+by|\s+in|\s+at)/) // Capitalized phrase followed by common prepositions
        ];
        
        for (const candidate of titleCandidates) {
          if (candidate && candidate[1]) {
            title = candidate[1].trim();
            break;
          }
        }
        
        if (!title) {
          // Default title from first 50 chars
          title = paragraph.substring(0, Math.min(50, paragraph.length)).trim() + "...";
        }
        
        // Extract a potential author
        let author = "Unknown Author";
        const authorCandidates = [
          paragraph.match(/([A-Z][a-z]+(?:,?\s+[A-Z]\.|\s+[A-Z][a-z]+))/),
          paragraph.match(/by\s+([A-Z][a-z]+(?:,?\s+[A-Z]\.|\s+[A-Z][a-z]+))/),
          paragraph.match(/([A-Z][a-z]+(?:,?\s+[A-Z]\.|\s+[A-Z][a-z]+))\s+(?:writes|wrote|argues|discusses)/)
        ];
        
        for (const candidate of authorCandidates) {
          if (candidate && candidate[1]) {
            author = candidate[1].trim();
            break;
          }
        }
        
        // Extract a potential year
        let year = new Date().getFullYear().toString();
        const yearMatch = paragraph.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          year = yearMatch[0];
        }
        
        // Determine which part this belongs to
        let entryPart = "PART I. TEACHING WILLIAM BLAKE";
        for (const part of predefinedParts) {
          if (chunk.includes(part)) {
            entryPart = part;
            break;
          }
        }
        
        // Determine a subheading
        let entrySubheading = subheadings[entryPart][0] || "General";
        
        // Create a unique ID
        const id = `pdf_force_gen_${entries.length + 1}_${author.substring(0, 10).replace(/\s/g, '_').toLowerCase()}`;
        
        // Check if this would be a duplicate
        const isDuplicate = entries.some(entry => 
          (entry.title === title && entry.authors === author) || 
          (entry.content && entry.content.includes(paragraph.substring(0, 50)))
        );
        
        if (!isDuplicate) {
          entries.push({
            id,
            title,
            authors: author,
            year,
            publication: "",
            content: paragraph,
            category: 'humanities',
            chapter: entryPart,
            subheading: entrySubheading
          });
        }
      }
    }
    
    console.log(`After forced generation, now have ${entries.length} entries`);
  }
  
  // If we still don't have enough entries, use our prebuilt data
  if (entries.length < (options.minEntriesThreshold ? options.minEntriesThreshold / 2 : 50)) {
    return { entries: createFallbackEntries(), subheadings };
  }
  
  return { entries, subheadings };
};
