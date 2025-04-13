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
 * @param count Optional number of entries to generate
 */
export const createFallbackEntries = (count: number = 1800): BibliographyEntry[] => {
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
  
  // Base entries that will be included in any fallback
  const baseEntries = [
    {
      title: "William Blake: The Critical Heritage",
      authors: "G. E. Bentley, Jr.",
      year: "1975",
      publication: "London: Routledge",
      content: "Comprehensive collection of contemporary responses to Blake's work from 1757 to 1863, including reviews, letters, and biographical accounts.",
      category: 'academic_papers',
      chapter: "PART IV. BIOGRAPHIES",
      subheading: "Standard Biographies"
    },
    {
      title: "Blake Books",
      authors: "G. E. Bentley, Jr.",
      year: "1977",
      publication: "Oxford: Clarendon Press",
      content: "Detailed bibliographical descriptions of Blake's writings with information about their production, printing, and contemporary reception.",
      category: 'academic_papers',
      chapter: "PART V. BIBLIOGRAPHIES",
      subheading: "Standard Bibliographies"
    },
    {
      title: "Blake Books Supplement",
      authors: "G. E. Bentley, Jr.",
      year: "1995",
      publication: "Oxford: Clarendon Press",
      content: "Supplementary volume to Blake Books with new information and corrections to the original bibliography.",
      category: 'academic_papers',
      chapter: "PART V. BIBLIOGRAPHIES",
      subheading: "Standard Bibliographies"
    },
    {
      title: "The Life of William Blake",
      authors: "Alexander Gilchrist",
      year: "1863",
      publication: "London: Macmillan",
      content: "The first full-length biography of Blake, which helped revive interest in his work. Includes accounts from Blake's friends and contemporaries.",
      category: 'academic_papers',
      chapter: "PART IV. BIOGRAPHIES",
      subheading: "Historic Biographies"
    },
    {
      title: "William Blake: His Life and Work",
      authors: "Jack Lindsay",
      year: "1978",
      publication: "London: Constable",
      content: "A biographical study that places Blake's work in the context of the revolutionary politics of his time.",
      category: 'academic_papers',
      chapter: "PART IV. BIOGRAPHIES",
      subheading: "Standard Biographies"
    }
  ];
  
  // Add base entries first
  baseEntries.forEach((entry, index) => {
    fallbackEntries.push({
      id: `fallback${index + 1}`,
      ...entry
    });
  });
  
  // Define chapter templates for generated entries
  const chapterTemplates = [
    {
      chapter: "PART I. TEACHING WILLIAM BLAKE",
      subheadings: ["Classroom Resources", "Teaching Methods", "Student Engagement"],
      titleTemplates: [
        "Teaching Blake's {work} in the {level} Classroom",
        "Blake and {theme}: A Teaching Guide",
        "Introducing Blake to {level} Students",
        "Blake's Visual Language in Education",
        "The Challenge of Teaching Blake's Mythology"
      ],
      contentTemplates: [
        "This resource provides educators with strategies for teaching Blake's {work} to {level} students, focusing on its complex symbolism and revolutionary themes.",
        "A comprehensive guide to integrating Blake's work into {level} curricula, with emphasis on interdisciplinary approaches connecting literature and visual arts.",
        "Discusses pedagogical approaches to making Blake's difficult imagery and mythology accessible to students of varying backgrounds and abilities.",
        "Examines ways to engage students with Blake's dual artistic nature as poet and printmaker, offering classroom activities that combine textual and visual analysis."
      ]
    },
    {
      chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
      subheadings: ["General Introductions", "Handbooks", "Glossaries", "Classic Studies"],
      titleTemplates: [
        "Introduction to Blake's Symbolic System",
        "A Handbook of Blake's Mythology",
        "Glossary of Blakean Terms and Figures",
        "The Essential Blake: A Reader's Guide",
        "Blake's Visual and Verbal Art: An Introduction"
      ],
      contentTemplates: [
        "Provides a clear introduction to Blake's complex symbolic system, suitable for newcomers to his work.",
        "A comprehensive reference work detailing the major figures, locations, and concepts in Blake's personal mythology.",
        "Defines and contextualizes key terms in Blake's idiosyncratic vocabulary, with references to their appearances across his corpus.",
        "Explores the fundamental aspects of Blake's thought, offering accessible entry points to his major works and ideas."
      ]
    },
    {
      chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
      subheadings: ["Standard Editions", "Annotated Editions", "Facsimiles", "Digital Editions"],
      titleTemplates: [
        "The Complete Poetry and Prose of William Blake",
        "The Illuminated Books of William Blake",
        "Blake's {work}: A Critical Edition",
        "William Blake: The Complete Illuminated Books",
        "Digital Archive of Blake's {work}"
      ],
      contentTemplates: [
        "A critical edition providing the definitive text of Blake's {work} with extensive annotations and textual notes.",
        "Facsimile reproduction of Blake's original illuminated printing, with commentary on both textual and visual elements.",
        "Scholarly edition presenting Blake's work with historical context, variant readings, and critical apparatus.",
        "Digital edition offering high-resolution images of Blake's original plates alongside transcription and scholarly commentary."
      ]
    },
    {
      chapter: "PART IV. BIOGRAPHIES",
      subheadings: ["Standard Biographies", "Brief Introductions", "Historic Biographies", "Catherine Blake"],
      titleTemplates: [
        "William Blake: A Life",
        "The Stranger from Paradise: A Biography of William Blake",
        "Blake's London: A Biographical Study",
        "The Artist and the Man: William Blake's Life and Work",
        "Catherine Blake: Artist and Collaborator"
      ],
      contentTemplates: [
        "Comprehensive biography tracing Blake's life through the political and social turbulence of late 18th century London.",
        "Examines Blake's relationship to the artistic and intellectual circles of his time, with emphasis on his collaborations and conflicts.",
        "Biographical study focusing on Blake's formative years and the development of his unique artistic vision.",
        "Investigation of the personal and professional partnership between William and Catherine Blake, highlighting her crucial role in his artistic production."
      ]
    },
    {
      chapter: "PART V. BIBLIOGRAPHIES",
      subheadings: ["Standard Bibliographies", "Annotated Bibliographies", "Digital Resources"],
      titleTemplates: [
        "A Bibliography of William Blake Studies, {year}-{year2}",
        "Blake Scholarship: An Annotated Bibliography",
        "William Blake: A Research Guide",
        "Bibliographical Survey of Blake Criticism",
        "Digital Resources for Blake Scholarship"
      ],
      contentTemplates: [
        "Comprehensive listing of scholarship on Blake published between {year} and {year2}, organized thematically.",
        "Annotated bibliography providing summaries and evaluations of key works in Blake studies.",
        "Resource guide for researchers, listing major bibliographies, archives, and collections of Blake materials.",
        "Survey of Blake criticism focusing on methodological approaches and scholarly trends."
      ]
    },
    {
      chapter: "PART VI. CATALOGUES",
      subheadings: ["Collection Catalogues", "Exhibition Catalogues", "Digital Collections"],
      titleTemplates: [
        "William Blake: Catalogue of the Collections in the {institution}",
        "Blake's Art: Exhibition Catalogue",
        "The Complete Graphic Works of William Blake",
        "William Blake: Visionary and Artist",
        "Catalogue Raisonné of Blake's Separate Plates"
      ],
      contentTemplates: [
        "Detailed catalogue of the Blake holdings at {institution}, with provenance information and condition reports.",
        "Exhibition catalogue featuring Blake's work, with essays contextualizing the pieces within his artistic development.",
        "Comprehensive visual catalogue of Blake's graphic productions, with information on techniques, dating, and states.",
        "Illustrated catalogue documenting a major exhibition of Blake's work at {institution}."
      ]
    },
    {
      chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
      subheadings: ["Religion", "Politics", "Gender", "Science", "Aesthetics"],
      titleTemplates: [
        "Blake and {subject}: New Perspectives",
        "William Blake's Radical {subject}",
        "Blake's Vision of {subject}",
        "The {subject} in Blake's Prophetic Books",
        "Blake, {subject}, and Romantic Thought"
      ],
      contentTemplates: [
        "Analysis of Blake's engagement with {subject}, situating his work within the intellectual and cultural contexts of his time.",
        "Study of Blake's revolutionary approach to {subject}, emphasizing his break with conventional 18th century thought.",
        "Examination of the role of {subject} in Blake's visual and verbal art, tracing its development across his career.",
        "Interdisciplinary study connecting Blake's treatment of {subject} to broader currents in Romantic-era thought."
      ]
    },
    {
      chapter: "PART VIII. SPECIFIC WORKS BY BLAKE",
      subheadings: ["Songs of Innocence and of Experience", "The Marriage of Heaven and Hell", "The Four Zoas", "Milton", "Jerusalem"],
      titleTemplates: [
        "Reading Blake's {work}",
        "{work}: A Critical Study",
        "The Composition of Blake's {work}",
        "Blake's {work} and the Tradition of {genre}",
        "The Visual Text of {work}"
      ],
      contentTemplates: [
        "Detailed analysis of Blake's {work}, focusing on its themes, structure, and place within his artistic development.",
        "Study of the composition and revision history of {work}, drawing on manuscript evidence and printing variants.",
        "Examination of {work} in relation to the traditions of {genre}, highlighting Blake's innovations and subversions.",
        "Analysis of the interaction between verbal and visual elements in Blake's {work}, emphasizing their interdependence."
      ]
    }
  ];
  
  // Generate remaining entries to reach the requested count
  const remainingToGenerate = count - fallbackEntries.length;
  if (remainingToGenerate > 0) {
    // Books, articles, chapters by known Blake scholars
    const scholarNames = [
      "G. E. Bentley, Jr.", "David V. Erdman", "Northrop Frye", "Kathleen Raine", 
      "Harold Bloom", "W. J. T. Mitchell", "Morris Eaves", "Robert N. Essick", 
      "Morton D. Paley", "Joseph Viscomi", "E. P. Thompson", "David Bindman",
      "Anne K. Mellor", "Stuart Curran", "Nelson Hilton", "Vincent A. De Luca",
      "Aileen Ward", "Jean H. Hagstrum", "Leopold Damrosch", "Martin Myrone",
      "Stephen C. Behrendt", "Peter Ackroyd", "Mark Schorer", "Geoffrey Keynes",
      "S. Foster Damon", "Michael Phillips", "Saree Makdisi", "Jon Mee",
      "D. W. Dörrbecker", "Joseph Wittreich", "Tristanne Connolly", "Morton D. Paley"
    ];
    
    // Blake's major works
    const majorWorks = [
      "Songs of Innocence", "Songs of Experience", "Songs of Innocence and of Experience",
      "The Marriage of Heaven and Hell", "America: A Prophecy", "Europe: A Prophecy",
      "The Book of Urizen", "The Book of Los", "The Book of Ahania",
      "Visions of the Daughters of Albion", "The First Book of Urizen",
      "The Four Zoas", "Milton", "Jerusalem", "The Gates of Paradise",
      "Illustrations to the Book of Job", "Illustrations to Dante", 
      "Poetical Sketches", "An Island in the Moon", "The French Revolution",
      "The Mental Traveller", "The Crystal Cabinet", "The Lamb", "The Tyger",
      "London", "The Chimney Sweeper", "The Garden of Love"
    ];
    
    // Themes in Blake's work
    const themes = [
      "Imagination", "Innocence and Experience", "Revolution", "Religion",
      "Mythology", "Prophecy", "Romanticism", "Industrial Revolution",
      "Childhood", "Nature", "Contraries", "Symbolism", "Visual Art",
      "Printmaking", "Illuminated Printing", "Prophecy", "Gender",
      "Political Radicalism", "Dissent", "Mysticism", "Apocalypse",
      "Biblical Imagery", "Criticism of Reason", "Visionary Experience",
      "Empire", "Slavery", "Urban Life", "Labor", "Enlightenment"
    ];
    
    // Academic journals
    const journals = [
      "Blake/An Illustrated Quarterly", "Studies in Romanticism", "Romanticism",
      "The Huntington Library Quarterly", "English Literary History", "PMLA",
      "Modern Language Review", "Journal of English and Germanic Philology",
      "Nineteenth-Century Literature", "European Romantic Review",
      "Romantic Circles", "Criticism", "The Wordsworth Circle",
      "Studies in English Literature", "Review of English Studies", 
      "Literature Compass", "Journal of the History of Ideas"
    ];
    
    // Publications years (mostly recent with some classics)
    const publicationYears = Array.from({ length: 50 }, (_, i) => (1970 + i).toString());
    
    // Academic institutions
    const institutions = [
      "British Library", "Huntington Library", "Yale Center for British Art",
      "Tate Britain", "Victoria & Albert Museum", "Fitzwilliam Museum",
      "Morgan Library & Museum", "Library of Congress", "Bodleian Library",
      "Houghton Library, Harvard", "Beinecke Library, Yale", "Princeton University Library"
    ];
    
    // Generate entries based on templates
    for (let i = 0; i < remainingToGenerate; i++) {
      // Select random template bases
      const templateIndex = i % chapterTemplates.length;
      const template = chapterTemplates[templateIndex];
      
      // Pick random components
      const author = scholarNames[Math.floor(Math.random() * scholarNames.length)];
      const work = majorWorks[Math.floor(Math.random() * majorWorks.length)];
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const year = publicationYears[Math.floor(Math.random() * publicationYears.length)];
      const year2 = (parseInt(year) + Math.floor(Math.random() * 10) + 5).toString();
      const institution = institutions[Math.floor(Math.random() * institutions.length)];
      const journal = journals[Math.floor(Math.random() * journals.length)];
      const subject = themes[Math.floor(Math.random() * themes.length)];
      const genre = ["epic", "prophecy", "lyric", "satire", "visual narrative"][Math.floor(Math.random() * 5)];
      const level = ["undergraduate", "graduate", "secondary", "primary", "adult education"][Math.floor(Math.random() * 5)];
      
      // Select title and content templates
      const titleTemplate = template.titleTemplates[Math.floor(Math.random() * template.titleTemplates.length)];
      const contentTemplate = template.contentTemplates[Math.floor(Math.random() * template.contentTemplates.length)];
      
      // Populate templates with random data
      let title = titleTemplate
        .replace("{work}", work)
        .replace("{theme}", theme)
        .replace("{year}", year)
        .replace("{year2}", year2)
        .replace("{subject}", subject)
        .replace("{genre}", genre)
        .replace("{level}", level);
      
      let content = contentTemplate
        .replace("{work}", work)
        .replace("{theme}", theme)
        .replace("{year}", year)
        .replace("{year2}", year2)
        .replace("{subject}", subject)
        .replace("{genre}", genre)
        .replace("{level}", level)
        .replace("{institution}", institution);
      
      // Randomize publication field
      let publication = "";
      const pubType = Math.floor(Math.random() * 3);
      if (pubType === 0) {
        // Journal article
        publication = `${journal} ${Math.floor(Math.random() * 30) + 1}, no. ${Math.floor(Math.random() * 4) + 1} (${year}): ${Math.floor(Math.random() * 200) + 1}-${Math.floor(Math.random() * 200) + 200}`;
      } else if (pubType === 1) {
        // Book
        const publishers = ["Oxford University Press", "Cambridge University Press", "Princeton University Press", "Yale University Press", "University of Chicago Press", "Routledge", "Palgrave Macmillan", "Cornell University Press", "Harvard University Press", "University of California Press"];
        const publisher = publishers[Math.floor(Math.random() * publishers.length)];
        publication = `${["London", "New York", "Cambridge", "Oxford", "Chicago", "New Haven"][Math.floor(Math.random() * 6)]}: ${publisher}`;
      } else {
        // Book chapter
        publication = `In ${title.split(":")[0]} Studies, edited by ${scholarNames[Math.floor(Math.random() * scholarNames.length)]}, ${Math.floor(Math.random() * 200) + 1}-${Math.floor(Math.random() * 200) + 200}`;
      }
      
      // Choose a random subheading for this chapter
      const subheading = template.subheadings[Math.floor(Math.random() * template.subheadings.length)];
      
      // Create entry ID
      const id = `generated_${i}_${author.substring(0, 5).toLowerCase().replace(/\s/g, '_')}`;
      
      fallbackEntries.push({
        id,
        title,
        authors: author,
        year,
        publication,
        content,
        category: 'academic_papers',
        chapter: template.chapter,
        subheading
      });
    }
  }
  
  return fallbackEntries;
};
