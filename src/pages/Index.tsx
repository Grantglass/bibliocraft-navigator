
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Info, Search, Download } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { bibliographyEntries } from '@/data/bibliographyData';

const Index = () => {
  return (
    <div className="min-h-screen bg-biblio-lightBlue">
      <header className="bg-biblio-navy text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">William Blake: An Annotated Bibliography</h1>
          <p className="mt-2 text-biblio-lightBlue">A comprehensive guide to Blake scholarship and resources</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-biblio-navy mb-4">William Blake: The Critical Heritage</h2>
            <p className="mb-3">
              This bibliography is based on G. E. Bentley, Jr.'s <em>William Blake: 
              The Critical Heritage</em> (London: Routledge, 1975), <em>Blake Books</em> 
              (Oxford: Clarendon Press, 1977), and <em>Blake Books Supplement</em> (Oxford: 
              Clarendon Press, 1995), along with materials from <em>Blake Books</em> (2000) and <em>Blake</em> (2001, 2006).
            </p>
            <p className="mb-3">
              Edited by Jason Whittaker (2018, 2021, 2023) and produced by the 
              William Blake Archive with assistance from the Bibliography Team.
            </p>
            
            <Alert className="my-6 border-biblio-navy">
              <AlertTitle className="text-biblio-navy">About This Bibliography</AlertTitle>
              <AlertDescription>
                This bibliography contains {bibliographyEntries.length} entries documenting scholarship on William Blake's art, 
                poetry, and influence. It represents one of the most comprehensive resources for Blake studies available today.
              </AlertDescription>
            </Alert>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-biblio-navy mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography" className="hover:text-biblio-navy hover:underline">INTRODUCTION</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART I. TEACHING WILLIAM BLAKE" className="hover:text-biblio-navy hover:underline">PART I. TEACHING WILLIAM BLAKE</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES" className="hover:text-biblio-navy hover:underline">PART II. GENERAL INTRODUCTIONS</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART III. EDITIONS OF BLAKE'S WRITING" className="hover:text-biblio-navy hover:underline">PART III. EDITIONS OF BLAKE'S WRITING</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART IV. BIOGRAPHIES" className="hover:text-biblio-navy hover:underline">PART IV. BIOGRAPHIES</Link>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART V. BIBLIOGRAPHIES" className="hover:text-biblio-navy hover:underline">PART V. BIBLIOGRAPHIES</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART VI. CATALOGUES" className="hover:text-biblio-navy hover:underline">PART VI. CATALOGUES</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT" className="hover:text-biblio-navy hover:underline">PART VII. STUDIES OF BLAKE</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART VIII. SPECIFIC WORKS BY BLAKE" className="hover:text-biblio-navy hover:underline">PART VIII. SPECIFIC WORKS BY BLAKE</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART IX. COLLECTIONS OF ESSAYS ON BLAKE PUBLISHED" className="hover:text-biblio-navy hover:underline">PART IX. COLLECTIONS OF ESSAYS</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="text-biblio-navy mr-2">•</span> 
                    <Link to="/bibliography?chapter=PART X. APPENDICES" className="hover:text-biblio-navy hover:underline">PART X. APPENDICES</Link>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-biblio-navy mb-4">Introduction</h2>
            <p className="mb-3">
              This bibliography aims to be as comprehensive as possible in covering the scholarly
              literature on William Blake. It includes books, articles, dissertations, and other
              materials that significantly discuss Blake's life, art, poetry, and influence.
            </p>
            <p className="mb-3">
              The entries are organized by category to facilitate research on specific aspects of
              Blake's work. Each entry provides bibliographic information and, where possible,
              a brief indication of the content and significance of the work.
            </p>
          </section>

          <section className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/bibliography">
              <Button size="lg" className="w-full md:w-auto flex items-center gap-2 bg-biblio-navy hover:bg-biblio-navy/90">
                <BookOpen size={18} />
                Browse Complete Bibliography
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="w-full md:w-auto flex items-center gap-2 border-biblio-navy text-biblio-navy hover:bg-biblio-navy/10">
                <Info size={18} />
                About the Project
              </Button>
            </Link>
            <a href="/blake_bibliography.pdf" download className="inline-block">
              <Button variant="outline" size="lg" className="w-full md:w-auto flex items-center gap-2 border-biblio-navy text-biblio-navy hover:bg-biblio-navy/10">
                <Download size={18} />
                Download PDF
              </Button>
            </a>
          </section>
        </div>
      </main>

      <footer className="bg-biblio-navy text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>© 2023 William Blake Archive. All rights reserved.</p>
          <p className="text-sm mt-2">Based on G. E. Bentley, Jr.'s bibliographic works</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
