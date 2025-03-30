
import { BibliographyEntry as BaseBibliographyEntry } from '@/data/bibliographyData';

// Extend the BibliographyEntry type to include the chapter property
declare module '@/data/bibliographyData' {
  interface BibliographyEntry extends BaseBibliographyEntry {
    chapter?: string;
  }
}
