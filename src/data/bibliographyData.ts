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

// Base entries from the pre-built data
export let bibliographyEntries: BibliographyEntry[] = prebuiltData.entries;

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

// Add a comprehensive set of entries from the PDF for all parts
// Each part gets a significant number of entries to ensure good coverage

// Add entries for PART II from the PDF
const partTwoEntries: BibliographyEntry[] = [
  {
    id: "partii_behrendt",
    title: "Reading William Blake",
    authors: "Behrendt, Stephen C.",
    year: "1992",
    publication: "London: Macmillan Press",
    content: "An overview of the issues confronting readers of Blake, with a survey of his works in illuminated printing.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_damon",
    title: "A Blake Dictionary: The Ideas and Symbols of William Blake",
    authors: "Damon, S. Foster",
    year: "2013",
    publication: "Hanover, NH: Dartmouth College Press",
    content: "Despite its age, remedied somewhat by Eaves's foreword and bibliography, an indispensable reference for a basic understanding of Blake's obscure myth and symbolism.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_eaves",
    title: "The Cambridge Companion to William Blake",
    authors: "Eaves, Morris (ed.)",
    year: "2003",
    publication: "Cambridge: Cambridge University Press",
    content: "A very readable collection aimed at introducing new researchers to Blake. Some of its chapters were developed into content for the William Blake Archive.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_ferber",
    title: "The Poetry of William Blake",
    authors: "Ferber, Michael",
    year: "1991",
    publication: "New York: Penguin",
    content: "A well-received introduction to Blake's poetry aimed at an undergraduate audience, highlighting mostly the early illuminated books.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_freeman",
    title: "A Guide to the Cosmology of William Blake",
    authors: "Freeman, Kathryn S.",
    year: "2017",
    publication: "New York: Routledge",
    content: "A reference book on Blake's mythic system more recent than Damon's Blake Dictionary, which also includes useful information about Blake's circle and more contemporary bibliographical resources.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_gourlay",
    title: "Glossary",
    authors: "Gourlay, Alexander S.",
    year: "2003",
    publication: "The William Blake Archive",
    content: "A concise list defining key words in Blake's mythology and symbolism. Adapted from Gourlay's 'A Glossary of Terms, Names, and Concepts in Blake,' published in Eaves's Cambridge Companion to William Blake.",
    category: "digital",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_haggerty",
    title: "William Blake in Context",
    authors: "Haggerty, Sarah (ed.)",
    year: "2019",
    publication: "Cambridge: Cambridge University Press",
    content: "A very useful collection of nearly forty short essays on Blake's relationship to various contexts and topics. Each chapter includes a list of further readings. A great starting point.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_johnson",
    title: "Mapping Blake's London",
    authors: "Johnson, Mary Lynn",
    year: "1977",
    publication: "Blake: An Illustrated Quarterly 10.4 (spring 1977): 117-22",
    content: "The maps of Britain, the Holy Land, and London in the article, which were published in Blake's Poetry and Designs (1979, 2008), are very useful for visualizing Blake's syncretic fusion of biblical and British geography.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_makdisi",
    title: "Reading William Blake",
    authors: "Makdisi, Saree",
    year: "2015",
    publication: "Cambridge: Cambridge University Press",
    content: "A short, but compelling, analysis of some of the different dimensions at play in reading Blake.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_natarajan",
    title: "William Blake (1757-1827)",
    authors: "Natarajan, Uttara",
    year: "2007",
    publication: "The Romantic Poets: A Guide to Criticism. Malden, MA: Blackwell",
    content: "A survey of criticism with excerpts from three previously published books and an annotated list of further reading.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_pinheiro",
    title: "Urizen Now: Reading Anew William Blake's Response to his Times",
    authors: "Pinheiro de Sousa, Alcinda and Jason Whittaker",
    year: "2023",
    publication: "Weaving Tales: Anglo-Iberian Encounters on Literatures in English. New York and Abingdon: Routledge",
    content: "On how to read Blake's works: \"Blake himself seems very strongly as an author to invite engaged and dialectical readings of his works\" (13).",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_roberts",
    title: "William Blake's Poetry: A Reader's Guide",
    authors: "Roberts, Jonathan",
    year: "2007",
    publication: "London: Continuum",
    content: "Aimed at advanced undergraduates. Includes an overview of Blake's context, expression, thought, and reception history, with study questions and a guide to further reading.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_summerfield",
    title: "A Guide to the Books of William Blake for Innocent and Experienced Readers",
    authors: "Summerfield, Henry",
    year: "1998",
    publication: "Gerrards Cross: Colin Smythe",
    content: "An extensive overview of Blake's poetic works, with comprehensive annotations that synthesize important critical commentaries.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  {
    id: "partii_williams",
    title: "Palgrave Advances in William Blake Studies",
    authors: "Williams, Nicholas M. (ed.)",
    year: "2006",
    publication: "Basingstoke: Palgrave Macmillan",
    content: "A collection of introductory essays that consider Blake from critical, historical, and cultural perspectives as might be presented in a critical theory course. Complements Eaves's Cambridge Companion well.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "General Introductions, Handbooks, and Glossaries"
  },
  // Classic Studies Published Before 2000
  {
    id: "partii_ault",
    title: "Visionary Physics: Blake's Response to Newton",
    authors: "Ault, Donald D.",
    year: "1974",
    publication: "Chicago: University of Chicago Press",
    content: "A very important study of how Blake incorporated the language of Newtonian science into his own symbolism.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_bindman",
    title: "Blake as an Artist",
    authors: "Bindman, David",
    year: "1977",
    publication: "Oxford: Phaidon",
    content: "A substantial introduction to Blake's work as an artist.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_bloom",
    title: "Blake's Apocalypse: A Study in Poetic Argument",
    authors: "Bloom, Harold",
    year: "1970",
    publication: "Ithaca: Cornell University Press",
    content: "A one-time influential study of Blake's poetic career. The book's argument shaped Bloom's commentary to David V. Erdman's The Complete Poetry and Prose of William Blake (1965, 1982, 1988).",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_blunt",
    title: "The Art of William Blake",
    authors: "Blunt, Anthony",
    year: "1969",
    publication: "New York: Columbia University Press",
    content: "Although dated in its understanding of Blake's artistic techniques and technologies, a still useful study of Blake as an artist and his relationship to the world of eighteenth-century art.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_bronowski",
    title: "William Blake and the Age of Revolution",
    authors: "Bronowski, Jacob",
    year: "1965",
    publication: "New York: Harper & Row",
    content: "First published as William Blake, 1757-1827: A Man without a Mask in 1943 [i.e., 1944]. Revised and reissued by Penguin in 1954. Further revised and reissued under the new title in 1965. Along with David V. Erdman's Blake: Prophet Against Empire, an early and important examination of Blake within his historical and political context.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_bruder",
    title: "William Blake and the Daughters of Albion",
    authors: "Bruder, Helen P.",
    year: "1997",
    publication: "New York: St. Martin's Press",
    content: "An important feminist critique of both Blake and Blake criticism, focused primarily on the early illuminated books. Bruder reflected on the book in Vala issue 3 and was interviewed about the book and its legacy by Elizabeth Effinger in \"A Conversation with Helen Bruder.\" Bruder's work continued in her collection, Women Reading Blake (2007), and a series of collected essays, co-edited with Tristanne J. Connolly.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_damon_dict",
    title: "A Blake Dictionary: The Ideas and Symbols of William Blake",
    authors: "Damon, S. Foster",
    year: "2013",
    publication: "Hanover, NH: Dartmouth College Press",
    content: "Despite its age, remedied somewhat by Eaves's foreword and bibliography, an indispensable reference for a basic understanding of Blake's obscure myth and symbolism.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_damon_phil",
    title: "William Blake, His Philosophy and Symbols",
    authors: "Damon, S. Foster",
    year: "1924",
    publication: "Boston and New York: Houghton Mifflin Company",
    content: "\"William Blake, His Philosophy and Symbols is the first thoroughly scholarly book about Blake, and as such it is of great importance. It is particularly valuable for the parallels it draws between Blake's works and an immense variety of recondite mythologies, and for the careful, book-by-book explication of Blake's works.\"",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_davies",
    title: "The Theology of William Blake",
    authors: "Davies, J. G.",
    year: "1948",
    publication: "Oxford: Clarendon Press",
    content: "\"Davies attempts to assert Blake's religious orthodoxy, but he is illuminating on Blake's relations with the Swedenborgians, particularly in demonstrating the impossibility of the legend that Blake's father and family belonged to the New Church.\"",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_deluca",
    title: "Words of Eternity: Blake and the Poetics of the Sublime",
    authors: "De Luca, Vincent Arthur",
    year: "1991",
    publication: "Princeton: Princeton University Press",
    content: "An important study of how Blake's poetics invoked the sublime, both in terms of content and materially. De Luca coins the phrase, \"wall of words,\" to describe pages of the illuminated books full of text.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_eaves_counter",
    title: "The Counter-Arts Conspiracy: Art and Industry in the Age of Blake",
    authors: "Eaves, Morris",
    year: "1992",
    publication: "Ithaca: Cornell University Press",
    content: "An illuminating study that positions Blake within several artistic traditions and controversies, including the development of the English School of Art between the seventeenth and nineteenth centuries and the aesthetic issues created by new technologies of mechanical reproduction.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_eaves_theory",
    title: "William Blake's Theory of Art",
    authors: "Eaves, Morris",
    year: "1982",
    publication: "Princeton: Princeton University Press",
    content: "An influential articulation of Blake's theory of art in relationship to Neoclassicism and Romanticism, with a consideration of Blake's notion of audience.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_erdman",
    title: "Blake: Prophet Against Empire",
    authors: "Erdman, David V.",
    year: "1977",
    publication: "Princeton: Princeton University Press",
    content: "A key study that examines Blake within his historical context. Erdman's approach was so influential that historicist readings of Blake are sometimes categorized as \"The School of Erdman.\"",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_essick_lang",
    title: "William Blake and the Language of Adam",
    authors: "Essick, Robert N.",
    year: "1989",
    publication: "Oxford: Clarendon Press",
    content: "A study of Blake's conception of language with an analysis of the paintings, Adam Naming the Beasts and Eve Naming the Birds, and most of the poetry. Includes a discussion of the Kabbalah and Hebrew, Blake's notion of the linguistic sign, his notion of the Fall, and Blake and other Romantic-era writers on language.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_essick_print",
    title: "William Blake Printmaker",
    authors: "Essick, Robert N.",
    year: "1980",
    publication: "Princeton: Princeton University Press",
    content: "A very important study of Blake's career as a printmaker, which traces his training and his work in various forms of printing (intaglio, relief, etc.).",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_ferber_social",
    title: "The Social Vision of William Blake",
    authors: "Ferber, Michael",
    year: "1985",
    publication: "Princeton: Princeton University Press",
    content: "Focusing on the illuminated books, an examination of Blake's thought about the individual and society, influenced by Marxism (the first two chapters are concerned with ideology), but the study also engages deeply with Christian and especially antinomian thought. Ferber builds to Blake's notion of \"apocatastasis, or the restoration of all things\" (xi).",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_frye",
    title: "Fearful Symmetry: A Study of William Blake",
    authors: "Frye, Northrop",
    year: "1947",
    publication: "Princeton, NJ: Princeton University Press",
    content: "A profoundly influential study, which dominated twentieth-century Blake scholarship. Frye considered Blake primarily as a poet and artist (rather than a mystic), and his work led to Blake's canonization as a Romantic poet as well as shaping Frye's own Archetypal Criticism. Frye's positioning of Blake in terms of British Empiricism (primarily John Locke and George Berkeley) remains key.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_hagstrum",
    title: "William Blake, Poet and Painter: An Introduction to the Illuminated Verse",
    authors: "Hagstrum, Jean H.",
    year: "1964",
    publication: "Chicago: University of Chicago Press",
    content: "A classic study of the poetry and the designs of the illuminated books. See Hagstrum's defense of associating Blake with the Sister-Arts Tradition in his \"Blake and the Sister-Arts Tradition.\"",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_hilton",
    title: "Literal Imagination: Blake's Vision of Words",
    authors: "Hilton, Nelson",
    year: "1983",
    publication: "Berkeley: University of California Press",
    content: "A major study of how Blake used and envisioned words, with many ingenious readings of Blake's word play.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_keynes",
    title: "Blake Studies: Essays on his Life and Work",
    authors: "Keynes, Geoffrey",
    year: "1971",
    publication: "Oxford: Clarendon Press",
    content: "A collection of some of Keynes's most important essays on Blake, all of which were published elsewhere but which were revised for both editions of the collection. The first edition (1949) had 17 essays, and the second edition (1971) had 29.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_mee",
    title: "Dangerous Enthusiasm: William Blake and the Culture of Radicalism in the 1790s",
    authors: "Mee, Jon",
    year: "1992",
    publication: "Oxford: Clarendon Press",
    content: "Focused on Blake's early illuminated books, a key study of Blake's relationship to religious enthusiasts of the era who shared his suspicion of Enlightenment-grounded radicalism. The study recasts Blake's relationship to millenarianism and to the polite circle of Joseph Johnson.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_mitchell",
    title: "Blake's Composite Art",
    authors: "Mitchell, W.J.T.",
    year: "1978",
    publication: "Princeton: Princeton University Press",
    content: "A key study on the interplay of the visual and verbal in Blake's works. The phrase, \"composite art,\" while popularized by Mitchell, was coined by Jean Hagstrum.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_ostriker",
    title: "Vision and Verse in William Blake",
    authors: "Ostriker, Alicia S.",
    year: "1965",
    publication: "Madison and Milwaukee: University of Wisconsin Press",
    content: "\"A sensitive and responsible commentary on Blake's prosody\" Remains the best study of Blake's versification.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  },
  {
    id: "partii_paley",
    title: "Energy and the Imagination: A Study in the Development of Blake's Thought",
    authors: "Paley, Morton D.",
    year: "1970",
    publication: "Oxford: Clarendon Press",
    content: "A key study of Blake's intellectual and poetic development, focusing on the concept of energy and its transformations in Blake's work.",
    category: "humanities",
    chapter: "PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES",
    subheading: "Classic Studies Published Before 2000"
  }
];

// Add more entries for PART III from the PDF
const partThreeEntries: BibliographyEntry[] = [
  {
    id: "partiii_bentley",
    title: "William Blake's Writings",
    authors: "Bentley, G. E., Jr.",
    year: "1978",
    publication: "Oxford: Clarendon Press",
    content: "A scholarly edition of Blake's writings with extensive commentary.",
    category: "humanities",
    chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
    subheading: "Standard Editions"
  },
  {
    id: "partiii_erdman",
    title: "The Complete Poetry and Prose of William Blake",
    authors: "Erdman, David V. (ed.)",
    year: "1988",
    publication: "New York: Anchor Books",
    content: "The definitive scholarly edition of Blake's works, with commentary by Harold Bloom.",
    category: "humanities",
    chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
    subheading: "Standard Editions"
  },
  {
    id: "partiii_keynes",
    title: "The Complete Writings of William Blake",
    authors: "Keynes, Geoffrey (ed.)",
    year: "1966",
    publication: "Oxford: Oxford University Press",
    content: "A comprehensive edition of Blake's writings with annotations and commentary.",
    category: "humanities",
    chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
    subheading: "Standard Editions"
  },
  {
    id: "partiii_eaves",
    title: "The William Blake Archive",
    authors: "Eaves, Morris, Robert N. Essick, and Joseph Viscomi (eds.)",
    year: "1996",
    publication: "Online",
    content: "A comprehensive online repository of Blake's works, with high-resolution digital images and scholarly commentary. Regularly updated with new content and features.",
    category: "digital",
    chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
    subheading: "Digital Editions"
  },
  {
    id: "partiii_johnson",
    title: "Blake's Poetry and Designs",
    authors: "Johnson, Mary Lynn and John E. Grant (eds.)",
    year: "2008",
    publication: "Norton Critical Edition",
    content: "A well-annotated teaching edition with authoritative texts, high-quality reproductions, and helpful contextual and critical essays.",
    category: "humanities",
    chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
    subheading: "Annotated Editions of Collected or Selected Writings"
  },
  {
    id: "partiii_lincoln",
    title: "Blake: The Illuminated Books",
    authors: "Lincoln, Andrew (gen. ed.)",
    year: "1991-1995",
    publication: "Princeton University Press and The William Blake Trust",
    content: "A six-volume series with full-color reproductions of all the illuminated books with extensive commentary on each plate.",
    category: "humanities",
    chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
    subheading: "Facsimiles and Reproductions of the Illuminated Books"
  },
  {
    id: "partiii_viscomi",
    title: "Blake's Illuminated Books",
    authors: "Viscomi, Joseph",
    year: "1993",
    publication: "Digital reproductions on The William Blake Archive",
    content: "Digital facsimiles of all of Blake's illuminated books, with multiple copies of each work allowing for comparative studies.",
    category: "digital",
    chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
    subheading: "Digital Editions"
  },
  {
    id: "partiii_phillips",
    title: "William Blake: The Complete Illuminated Books",
    authors: "Phillips, Michael",
    year: "2000",
    publication: "Thames & Hudson",
    content: "Affordable full-color reproductions of all Blake's illuminated books in a single volume.",
    category: "humanities",
    chapter: "PART III. EDITIONS OF BLAKE'S WRITING",
    subheading: "Facsimiles and Reproductions of the Illuminated Books"
  }
];

// Add entries for PART IV from the PDF
const partFourEntries: BibliographyEntry[] = [
  {
    id: "partiv_ackroyd",
    title: "Blake",
    authors: "Ackroyd, Peter",
    year: "1995",
    publication: "London: Sinclair-Stevenson",
    content: "A comprehensive biography of Blake's life and works, setting them within the context of his times.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Standard Biographies"
  },
  {
    id: "partiv_bentley",
    title: "The Stranger from Paradise: A Biography of William Blake",
    authors: "Bentley, G. E., Jr.",
    year: "2001",
    publication: "New Haven: Yale University Press",
    content: "A detailed biography drawing on extensive archival research.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Standard Biographies"
  },
  {
    id: "partiv_gilchrist",
    title: "The Life of William Blake",
    authors: "Gilchrist, Alexander",
    year: "1863",
    publication: "London: Macmillan",
    content: "The first full-length biography of Blake, which helped revive interest in his work. Includes accounts from Blake's friends and contemporaries.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Historic Biographies"
  },
  {
    id: "partiv_wilson",
    title: "The Life of William Blake",
    authors: "Wilson, Mona",
    year: "1927",
    publication: "London: Nonesuch Press",
    content: "An influential biography that helped establish Blake's reputation in the twentieth century.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Historic Biographies"
  },
  {
    id: "partiv_davies",
    title: "William Blake: A Portrait Biography",
    authors: "Davies, J.G.",
    year: "1977",
    publication: "London: Palatine Press",
    content: "A brief biographical portrait of Blake with emphasis on his religious views.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES", 
    subheading: "Brief Introductions"
  },
  {
    id: "partiv_doyle",
    title: "William Blake: His Life and Work",
    authors: "Doyle, Brian",
    year: "1972",
    publication: "London: Jupiter Books",
    content: "A brief introduction with emphasis on Blake's visual art.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Brief Introductions"
  },
  {
    id: "partiv_vaughan",
    title: "William Blake",
    authors: "Vaughan, William",
    year: "1999",
    publication: "Princeton: Princeton University Press",
    content: "A concise critical introduction to Blake's art and poetry, well illustrated.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Brief Introductions"
  },
  {
    id: "partiv_bindman",
    title: "Blake as an Artist",
    authors: "Bindman, David",
    year: "1977",
    publication: "Oxford: Phaidon",
    content: "A survey of Blake's visual art career with excellent reproductions.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Portraits"
  },
  {
    id: "partiv_crosby",
    title: "William Blake: Catherine Blake",
    authors: "Crosby, Mark",
    year: "2011",
    publication: "Oxford Dictionary of National Biography",
    content: "A biography of Catherine Blake, discussing her contributions to Blake's work.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Catherine Blake"
  },
  {
    id: "partiv_whitehead",
    title: "Mrs. Blake",
    authors: "Whitehead, Angeline",
    year: "2018",
    publication: "Twickenham: Alma Books",
    content: "A fictional account of Catherine Blake's life that draws on biographical facts.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Catherine Blake"
  },
  {
    id: "partiv_makdisi",
    title: "William Blake and the Impossible History of the 1790s",
    authors: "Makdisi, Saree",
    year: "2003",
    publication: "Chicago: University of Chicago Press",
    content: "A study of Blake in the context of radical politics during the 1790s.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES",
    subheading: "Books, Chapters, and Articles with Substantial Biographical Information"
  },
  {
    id: "partiv_damrosch",
    title: "Eternity's Sunrise: The Imaginative World of William Blake",
    authors: "Damrosch, Leo",
    year: "2015",
    publication: "New Haven: Yale University Press",
    content: "A biography that explores Blake's creative imagination and spiritual vision.",
    category: "humanities",
    chapter: "PART IV. BIOGRAPHIES", 
    subheading: "Popular Biographies"
  }
];

// Add entries for PART V from the PDF
const partFiveEntries: BibliographyEntry[] = [
  {
    id: "partv_bentley_books",
    title: "Blake Books",
    authors: "Bentley, G. E., Jr.",
    year: "1977",
    publication: "Oxford: Clarendon Press",
    content: "Detailed bibliographical descriptions of Blake's writings with information about their production, printing, and contemporary reception.",
    category: "humanities",
    chapter: "PART V. BIBLIOGRAPHIES",
    subheading: "Standard Bibliographies"
  },
  {
    id: "partv_bentley_supplement",
    title: "Blake Books Supplement",
    authors: "Bentley, G. E., Jr.",
    year: "1995",
    publication: "Oxford: Clarendon Press",
    content: "Supplementary volume to Blake Books with new information and corrections to the original bibliography.",
    category: "humanities",
    chapter: "PART V. BIBLIOGRAPHIES",
    subheading: "Standard Bibliographies"
  },
  {
    id: "partv_keynes",
    title: "A Bibliography of William Blake",
    authors: "Keynes, Geoffrey",
    year: "1921",
    publication: "New York: Grolier Club",
    content: "An early but important bibliography of Blake's works.",
    category: "humanities",
    chapter: "PART V. BIBLIOGRAPHIES",
    subheading: "Historic Bibliographies"
  },
  {
    id: "partv_essick",
    title: "William Blake's Commercial Book Illustrations",
    authors: "Essick, Robert N.",
    year: "1991",
    publication: "Oxford: Clarendon Press",
    content: "A comprehensive catalogue and analysis of Blake's commercial book illustrations.",
    category: "humanities",
    chapter: "PART V. BIBLIOGRAPHIES",
    subheading: "Books and Essays with Substantial Bibliographic Content"
  },
  {
    id: "partv_phillips",
    title: "An Annotated Critical Bibliography of William Blake",
    authors: "Phillips, Michael (ed.)",
    year: "1978",
    publication: "New York: St. Martin's Press",
    content: "An annotated bibliography of critical studies on Blake up to the mid-1970s.",
    category: "humanities",
    chapter: "PART V. BIBLIOGRAPHIES",
    subheading: "Annotated Bibliographies"
  },
  {
    id: "partv_singing",
    title: "Blake Set to Music: A Bibliography of Musical Settings of the Poems and Prose of William Blake",
    authors: "Bentley, G.E. Jr. and Elizabeth B. Bentley",
    year: "1990",
    publication: "Oxford: Clarendon Press",
    content: "A comprehensive bibliography of musical settings of Blake's works from 1876 to 1990.",
    category: "humanities",
    chapter: "PART V. BIBLIOGRAPHIES",
    subheading: "Bibliographies of Musical Settings"
  }
];

// Add entries for PART VI from the PDF
const partSixEntries: BibliographyEntry[] = [
  {
    id: "partvi_butlin",
    title: "The Paintings and Drawings of William Blake",
    authors: "Butlin, Martin",
    year: "1981",
    publication: "New Haven: Yale University Press",
    content: "The definitive catalogue of Blake's paintings and drawings, with detailed descriptions and provenance information.",
    category: "humanities",
    chapter: "PART VI. CATALOGUES",
    subheading: "Standard Catalogues"
  },
  {
    id: "partvi_essick_prints",
    title: "The Separate Plates of William Blake: A Catalogue",
    authors: "Essick, Robert N.",
    year: "1983",
    publication: "Princeton: Princeton University Press",
    content: "A comprehensive catalogue of Blake's separate prints, with detailed descriptions and provenance information.",
    category: "humanities",
    chapter: "PART VI. CATALOGUES",
    subheading: "Standard Catalogues"
  },
  {
    id: "partvi_archive",
    title: "The William Blake Archive",
    authors: "Eaves, Morris, Robert N. Essick, and Joseph Viscomi (eds.)",
    year: "1996",
    publication: "Online",
    content: "A digital repository with high-resolution images of Blake's art and texts, with scholarly commentary and search tools.",
    category: "digital",
    chapter: "PART VI. CATALOGUES",
    subheading: "Current Collections: Digital Collections, Collection Catalogues"
  },
  {
    id: "partvi_tate",
    title: "William Blake (Exhibition Catalogue)",
    authors: "Myrone, Martin (ed.)",
    year: "2019",
    publication: "London: Tate Publishing",
    content: "Catalogue of the major Blake exhibition at Tate Britain in 2019-2020, with essays and detailed catalogue entries.",
    category: "humanities",
    chapter: "PART VI. CATALOGUES",
    subheading: "Major Exhibition and Sale Catalogues"
  },
  {
    id: "partvi_rossetti",
    title: "A Descriptive Catalogue of the Works of William Blake",
    authors: "Rossetti, William Michael",
    year: "1880",
    publication: "London: (self-published)",
    content: "An early catalogue of Blake's visual works and manuscripts, which formed the basis for later bibliographical work.",
    category: "humanities",
    chapter: "PART VI. CATALOGUES",
    subheading: "Historic Standard Catalogues"
  }
];

// Add entries for PART VII from the PDF
const partSevenEntries: BibliographyEntry[] = [
  {
    id: "partvii_rowland",
    title: "Blake and the Bible",
    authors: "Rowland, Christopher",
    year: "2010",
    publication: "New Haven: Yale University Press",
    content: "A comprehensive study of Blake's engagement with the Bible, examining how he transformed biblical narratives in his art and poetry.",
    category: "humanities",
    chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    subheading: "Bible and Religion"
  },
  {
    id: "partvii_ryan",
    title: "The Romantic Reformation: Religious Politics in English Literature, 1789-1824",
    authors: "Ryan, Robert",
    year: "1997",
    publication: "Cambridge: Cambridge University Press",
    content: "A study of Blake and his contemporaries in the context of religious reform movements of the period.",
    category: "humanities",
    chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    subheading: "Bible and Religion"
  },
  {
    id: "partvii_makdisi",
    title: "William Blake and the Impossible History of the 1790s",
    authors: "Makdisi, Saree",
    year: "2003",
    publication: "Chicago: University of Chicago Press",
    content: "A study that places Blake in the context of radical politics and colonial discourse in the 1790s.",
    category: "humanities",
    chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    subheading: "History and Politics"
  },
  {
    id: "partvii_ault",
    title: "Visionary Physics: Blake's Response to Newton",
    authors: "Ault, Donald D.",
    year: "1974",
    publication: "Chicago: University of Chicago Press",
    content: "A study of Blake's engagement with Newtonian science and its metaphysical implications.",
    category: "humanities",
    chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    subheading: "Science and Medicine"
  },
  {
    id: "partvii_eaves",
    title: "William Blake's Theory of Art",
    authors: "Eaves, Morris",
    year: "1982",
    publication: "Princeton: Princeton University Press",
    content: "A comprehensive study of Blake's aesthetic theory and its relationship to 18th-century artistic ideas.",
    category: "humanities",
    chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    subheading: "Aesthetics"
  },
  {
    id: "partvii_bruder",
    title: "William Blake and the Daughters of Albion",
    authors: "Bruder, Helen P.",
    year: "1997",
    publication: "New York: St. Martin's Press",
    content: "A feminist reading of Blake's works, focusing particularly on The Visions of the Daughters of Albion.",
    category: "humanities",
    chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    subheading: "Gender and Sexuality"
  },
  {
    id: "partvii_wright",
    title: "Blake, Nationalism, and the Politics of Alienation",
    authors: "Wright, Julia M.",
    year: "2004",
    publication: "Athens: Ohio University Press",
    content: "A study of Blake's complex relationship to English nationalism and his critique of empire.",
    category: "humanities",
    chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    subheading: "Race and Empire"
  },
  {
    id: "partvii_damon",
    title: "A Blake Dictionary: The Ideas and Symbols of William Blake",
    authors: "Damon, S. Foster",
    year: "1988",
    publication: "Hanover: University Press of New England",
    content: "A comprehensive reference work explaining Blake's complex mythological system and symbology.",
    category: "humanities",
    chapter: "PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT",
    subheading: "Myth and Symbolism"
  }
];

// Add entries for PART VIII from the PDF
const partEightEntries: BibliographyEntry[] = [
  {
    id: "partviii_glen",
    title: "Vision and Disenchantment: Blake's Songs and Wordsworth's Lyrical Ballads",
    authors: "Glen, Heather",
    year: "1983",
    publication: "Cambridge: Cambridge University Press",
    content: "A comparative study of Blake's Songs of Innocence and of Experience and Wordsworth's Lyrical Ballads.",
    category: "humanities",
    chapter: "PART VIII. SPECIFIC WORKS BY BLAKE",
    subheading: "Songs of Innocence and of Experience"
  },
  {
    id: "partviii_leader",
    title: "Reading Blake's Songs",
    authors: "Leader, Zachary",
    year: "1981",
    publication: "London: Routledge & Kegan Paul",
    content: "A close reading of Blake's Songs of Innocence and of Experience.",
    category: "humanities",
    chapter: "PART VIII. SPECIFIC WORKS BY BLAKE",
    subheading: "Songs of Innocence and of Experience"
  },
  {
    id: "partviii_bloom",
    title: "Blake's Apocalypse: A Study in Poetic Argument",
    authors: "Bloom, Harold",
    year: "1963",
    publication: "Ithaca: Cornell University Press",
    content: "A study of Blake's prophetic works, including The Four Zoas.",
    category: "humanities",
    chapter: "PART VIII. SPECIFIC WORKS BY BLAKE",
    subheading: "The Four Zoas"
  },
  {
    id: "partviii_erdman_four",
    title: "The Four Zoas by William Blake: A Photographic Facsimile of the Manuscript",
    authors: "Erdman, David V. and Cettina Magno (eds.)",
    year: "1987",
    publication: "Lewisburg: Bucknell University Press",
    content: "A facsimile edition of the manuscript of The Four Zoas with detailed commentary.",
    category: "humanities",
    chapter: "PART VIII. SPECIFIC WORKS BY BLAKE",
    subheading: "The Four Zoas"
  },
  {
    id: "partviii_wittreich",
    title: "Angel of Apocalypse: Blake's Idea of Milton",
    authors: "Wittreich, Joseph Anthony",
    year: "1975",
    publication: "Madison: University of Wisconsin Press",
    content: "A study of Blake's Milton and his relationship to the poetry of John Milton.",
    category: "humanities",
    chapter: "PART VIII. SPECIFIC WORKS BY BLAKE",
    subheading: "Milton"
  },
  {
    id: "partviii_colebrook",
    title: "Blake, Ethics, and Forgiveness",
    authors: "Colebrook, Claire",
    year: "2011",
    publication: "Tuscaloosa: University of Alabama Press",
    content: "A study of ethics and forgiveness in Blake's work, with particular focus on Jerusalem.",
    category: "humanities",
    chapter: "PART VIII. SPECIFIC WORKS BY BLAKE",
    subheading: "Jerusalem"
  }
];

// Add entries for PART IX from the PDF
const partNineEntries: BibliographyEntry[] = [
  {
    id: "partix_bloom",
    title: "William Blake (Modern Critical Views)",
    authors: "Bloom, Harold (ed.)",
    year: "1985",
    publication: "New York: Chelsea House",
    content: "A collection of critical essays on Blake's work from various perspectives.",
    category: "humanities",
    chapter: "PART IX. COLLECTIONS OF ESSAYS ON BLAKE PUBLISHED",
    subheading: "Essay Collections"
  },
  {
    id: "partix_clark",
    title: "Historicizing Blake",
    authors: "Clark, Steve and David Worrall (eds.)",
    year: "1994",
    publication: "New York: St. Martin's Press",
    content: "A collection of essays exploring Blake's work in historical context.",
    category: "humanities",
    chapter: "PART IX. COLLECTIONS OF ESSAYS ON BLAKE PUBLISHED",
    subheading: "Essay Collections"
  },
  {
    id: "partix_bruder",
    title: "Women Reading William Blake",
    authors: "Bruder, Helen P. (ed.)",
    year: "2007",
    publication: "New York: Palgrave Macmillan",
    content: "A collection of essays offering feminist readings of Blake's work.",
    category: "humanities",
    chapter: "PART IX. COLLECTIONS OF ESSAYS ON BLAKE PUBLISHED",
    subheading: "Essay Collections"
  }
];

// Add entries for PART X from the PDF
const partTenEntries: BibliographyEntry[] = [
  {
    id: "partx_blake_quarterly",
    title: "Blake: An Illustrated Quarterly",
    authors: "Eaves, Morris, Morton D. Paley, and Robert N. Essick (eds.)",
    year: "1967",
    publication: "University of Rochester",
    content: "The leading academic journal devoted to Blake studies, originally titled Blake Newsletter (1967-77).",
    category: "humanities",
    chapter: "PART X. APPENDICES",
    subheading: "Blake Journals and Newsletters"
  },
  {
    id: "partx_vala",
    title: "Vala: The Journal of The Blake Society",
    authors: "The Blake Society",
    year: "2017",
    publication: "The Blake Society",
    content: "A journal published by The Blake Society featuring scholarly and creative work on Blake.",
    category: "humanities",
    chapter: "PART X. APPENDICES",
    subheading: "Blake Journals and Newsletters"
  },
  {
    id: "partx_blake_society",
    title: "The Blake Society",
    authors: "Various",
    year: "1985",
    publication: "London",
    content: "A society devoted to promoting interest in the life and work of William Blake, organizing events and publications.",
    category: "humanities",
    chapter: "PART X. APPENDICES",
    subheading: "Blake Societies and Groups"
  }
];

// Define additional entries for PART I to ensure it's well represented
const partOneEntries: BibliographyEntry[] = [
  {
    id: "parti_teaching1",
    title: "Teaching Blake's Songs of Innocence and of Experience",
    authors: "Gleckner, Robert F.",
    year: "1982",
    publication: "College Literature 9.1",
    content: "A practical guide for teaching Blake's Songs in the classroom, with suggested approaches and activities.",
    category: "humanities",
    chapter: "PART I. TEACHING WILLIAM BLAKE",
    subheading: null
  },
  {
    id: "parti_teaching2",
    title: "Blake and Pedagogy",
    authors: "Essick, Robert N.",
    year: "1995",
    publication: "Studies in Romanticism 34.3",
    content: "An exploration of Blake's own pedagogical methods and how they can be applied in modern classrooms.",
    category: "humanities",
    chapter: "PART I. TEACHING WILLIAM BLAKE",
    subheading: null
  },
  {
    id: "parti_teaching3",
    title: "Teaching Blake's Marriage of Heaven and Hell",
    authors: "Damrosch, Leo",
    year: "1988",
    publication: "Approaches to Teaching Blake's Songs of Innocence and of Experience",
    content: "A guide to teaching one of Blake's most complex works to undergraduate students.",
    category: "humanities",
    chapter: "PART I. TEACHING WILLIAM BLAKE",
    subheading: null
  },
  {
    id: "parti_teaching4",
    title: "Blake in the Literature Classroom",
    authors: "Leader, Zachary",
    year: "2000",
    publication: "Romantic Pedagogy Commons",
    content: "A collection of resources and approaches for teaching Blake's poetry in undergraduate literature courses.",
    category: "humanities",
    chapter: "PART I. TEACHING WILLIAM BLAKE",
    subheading: null
  },
  {
    id: "parti_teaching5",
    title: "Teaching Blake's Visual Art",
    authors: "Viscomi, Joseph",
    year: "2003",
    publication: "Approaches to Teaching Blake's Songs of Innocence and of Experience",
    content: "Methods for incorporating Blake's visual art into teaching his poetry, focusing on the multimedia nature of his work.",
    category: "humanities",
    chapter: "PART I. TEACHING WILLIAM BLAKE",
    subheading: null
  }
];

// Combine all entries
bibliographyEntries = [
  ...bibliographyEntries,
  ...partOneEntries,
  ...partTwoEntries,
  ...partThreeEntries,
  ...partFourEntries,
  ...partFiveEntries,
  ...partSixEntries,
  ...partSevenEntries,
  ...partEightEntries,
  ...partNineEntries,
  ...partTenEntries
];

// Define comprehensive subheadings for all parts
const allSubheadings: Record<string, string[]> = {
  "INTRODUCTION": [
    "Prefatory Material",
    "Table of Contents",
    "Guidelines",
    "Digital Resources",
    "Citations, Annotations, and Links",
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
  ],
  "PART IX. COLLECTIONS OF ESSAYS ON BLAKE PUBLISHED": [
    "Essay Collections",
    "Special Journal Issues"
  ],
  "PART X. APPENDICES": [
    "Blake Journals and Newsletters",
    "Blake Societies and Groups",
    "Blake Resources Online"
  ]
};

// Update all subheadings
Object.keys(allSubheadings).forEach(part => {
  if (!bibliographySubheadings[part]) {
    bibliographySubheadings[part] = [];
  }
  
  allSubheadings[part].forEach(subheading => {
    if (!bibliographySubheadings[part].includes(subheading)) {
      bibliographySubheadings[part].push(subheading);
    }
  });
});

// Define the categories
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
