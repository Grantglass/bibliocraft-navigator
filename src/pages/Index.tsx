
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Info, Search } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
            <h2 className="text-2xl font-bold text-biblio-navy mb-4">About This Bibliography</h2>
            <p className="mb-3">
              This is an updated version of G. E. Bentley, Jr.'s William Blake: 
              The Critical Heritage (London: Routledge, 1975) and Blake Books 
              (Oxford: Clarendon Press, 1977) and Blake Books Supplement (Oxford: 
              Clarendon Press, 1995), plus materials from Blake Books (2000) and Blake (2001, 2006).
            </p>
            <p className="mb-3">
              Edited by Jason Whittaker (2018, 2021, 2023) and produced by the 
              William Blake Archive with assistance from the Bibliography Team.
            </p>
            
            <Alert className="my-6">
              <AlertTitle>The William Blake Bibliography</AlertTitle>
              <AlertDescription>
                This bibliography contains thousands of entries organized by categories to facilitate research on Blake's art, poetry, and influence.
              </AlertDescription>
            </Alert>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-biblio-navy mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ul className="space-y-2">
                  <li className="flex items-center"><span className="text-biblio-navy mr-2">•</span> User Note</li>
                  <li className="flex items-center"><span className="text-biblio-navy mr-2">•</span> Abbreviations</li>
                  <li className="flex items-center"><span className="text-biblio-navy mr-2">•</span> PART I. TEACHING WILLIAM BLAKE</li>
                  <li className="flex items-center"><span className="text-biblio-navy mr-2">•</span> PART II. GENERAL INTRODUCTIONS</li>
                  <li className="flex items-center"><span className="text-biblio-navy mr-2">•</span> PART III. EDITIONS OF BLAKE'S WRITING</li>
                </ul>
              </div>
              <div>
                <ul className="space-y-2">
                  <li className="flex items-center"><span className="text-biblio-navy mr-2">•</span> PART IV. BIOGRAPHIES</li>
                  <li className="flex items-center"><span className="text-biblio-navy mr-2">•</span> PART V. BIBLIOGRAPHIES</li>
                  <li className="flex items-center"><span className="text-biblio-navy mr-2">•</span> PART VI-X. ADDITIONAL SECTIONS</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/bibliography">
              <Button size="lg" className="w-full md:w-auto flex items-center gap-2 bg-biblio-navy hover:bg-biblio-navy/90">
                <BookOpen size={18} />
                Browse Bibliography
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="w-full md:w-auto flex items-center gap-2 border-biblio-navy text-biblio-navy hover:bg-biblio-navy/10">
                <Info size={18} />
                About the Project
              </Button>
            </Link>
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
