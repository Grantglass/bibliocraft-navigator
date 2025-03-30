
import { BibliographyEntry as BaseBibliographyEntry } from '@/data/bibliographyData';

// Extend the BibliographyEntry type to include the chapter and subheading properties
declare module '@/data/bibliographyData' {
  interface BibliographyEntry extends BaseBibliographyEntry {
    chapter?: string;
    subheading?: string;
  }
}
