
import * as pdfjsLib from 'pdfjs-dist';
import { BibliographyEntry } from '@/data/bibliographyData';

// Set worker source path (moved from component)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Processes a single page from a PDF document and extracts its text
 */
export const processPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
  try {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.map((item: any) => item.str);
    const pageText = textItems.join(' ');
    
    // Clean up page resources
    page.cleanup();
    
    return pageText;
  } catch (error) {
    console.error(`Error processing page ${pageNum}:`, error);
    return '';
  }
};

/**
 * Creates introductory entries from the introduction text
 */
export const createIntroductionEntries = (introText: string): BibliographyEntry[] => {
  const introductionEntries: BibliographyEntry[] = [];
  
  // Extract some meaningful sections from the introduction
  const sections = introText.split(/\n\n|\r\n\r\n/).filter(section => 
    section.trim().length > 50 && 
    !section.includes("Page") && 
    !section.includes("Table of") &&
    !section.trim().match(/^\d+$/)
  );
  
  // Add introduction entries
  introductionEntries.push({
    id: `intro1`,
    title: "William Blake: An Annotated Bibliography",
    authors: "Editorial Team",
    year: new Date().getFullYear().toString(),
    publication: "Introduction",
    content: "This bibliography serves as a comprehensive resource for scholars, students, and enthusiasts of William Blake. The following pages contain a carefully curated collection of bibliographic entries spanning Blake's works, critical responses, and scholarly analyses.",
    category: 'introduction',
    chapter: "INTRODUCTION",
    subheading: "Prefatory Material"
  });
  
  // Extract and add sections from the introduction text
  let count = 2;
  for (let i = 0; i < Math.min(sections.length, 5); i++) {
    const section = sections[i];
    if (section.length < 50) continue;
    
    let title = "";
    let content = section;
    
    // Try to extract a title from the first line
    const lines = section.split(/\n|\r\n/);
    if (lines[0] && lines[0].length < 100 && lines[0].length > 10) {
      title = lines[0].trim();
      content = section.substring(title.length).trim();
    } else {
      title = `Introduction Section ${count}`;
    }
    
    let subheading = "Prefatory Material";
    if (section.toLowerCase().includes("contents") || 
        section.toLowerCase().includes("chapter") || 
        section.toLowerCase().includes("section")) {
      subheading = "Table of Contents";
    } else if (section.toLowerCase().includes("guideline") || 
               section.toLowerCase().includes("instruction") || 
               section.toLowerCase().includes("how to")) {
      subheading = "Guidelines";
    }
    
    introductionEntries.push({
      id: `intro${count++}`,
      title: title,
      authors: "Editorial Team",
      year: new Date().getFullYear().toString(),
      publication: "Introduction",
      content: content.substring(0, 500) + (content.length > 500 ? "..." : ""),
      category: 'introduction',
      chapter: "INTRODUCTION",
      subheading: subheading
    });
  }
  
  return introductionEntries;
};

/**
 * Creates fallback bibliography entries if no entries are found or an error occurs
 */
export const createFallbackEntries = (): BibliographyEntry[] => {
  const fallbackEntries: BibliographyEntry[] = [];
  
  // Add an introduction entry
  fallbackEntries.push({
    id: `intro_fallback`,
    title: "William Blake: An Annotated Bibliography",
    authors: "Editorial Team",
    year: new Date().getFullYear().toString(),
    publication: "Introduction",
    content: "This bibliography serves as a comprehensive resource for scholars, students, and enthusiasts of William Blake. The following pages contain a carefully curated collection of bibliographic entries spanning Blake's works, critical responses, and scholarly analyses.",
    category: 'introduction',
    chapter: "INTRODUCTION",
    subheading: "Prefatory Material"
  });
  
  // Add some fallback entries to ensure we have at least some data to display
  fallbackEntries.push({
    id: `fallback1`,
    title: "William Blake: The Critical Heritage",
    authors: "G. E. Bentley, Jr.",
    year: "1975",
    publication: "London: Routledge",
    content: "Comprehensive collection of contemporary responses to Blake's work from 1757 to 1863, including reviews, letters, and biographical accounts.",
    category: 'academic_papers',
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Standard Biographies"
  });
  
  // Add more fallback entries
  fallbackEntries.push({
    id: `fallback2`,
    title: "Blake Books",
    authors: "G. E. Bentley, Jr.",
    year: "1977",
    publication: "Oxford: Clarendon Press",
    content: "Detailed bibliographical descriptions of Blake's writings with information about their production, printing, and contemporary reception.",
    category: 'academic_papers',
    chapter: "PART V. BIBLIOGRAPHIES",
    subheading: "Standard Bibliographies"
  });
  
  fallbackEntries.push({
    id: `fallback3`,
    title: "Blake Books Supplement",
    authors: "G. E. Bentley, Jr.",
    year: "1995",
    publication: "Oxford: Clarendon Press",
    content: "Supplementary volume to Blake Books with new information and corrections to the original bibliography.",
    category: 'academic_papers',
    chapter: "PART V. BIBLIOGRAPHIES",
    subheading: "Standard Bibliographies"
  });
  
  fallbackEntries.push({
    id: `fallback4`,
    title: "The Life of William Blake",
    authors: "Alexander Gilchrist",
    year: "1863",
    publication: "London: Macmillan",
    content: "The first full-length biography of Blake, which helped revive interest in his work. Includes accounts from Blake's friends and contemporaries.",
    category: 'academic_papers',
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Historic Biographies"
  });
  
  fallbackEntries.push({
    id: `fallback5`,
    title: "William Blake: His Life and Work",
    authors: "Jack Lindsay",
    year: "1978",
    publication: "London: Constable",
    content: "A biographical study that places Blake's work in the context of the revolutionary politics of his time.",
    category: 'academic_papers',
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Standard Biographies"
  });
  
  return fallbackEntries;
};
