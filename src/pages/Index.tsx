
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, List, Info } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-biblio-lightBlue">
      <header className="bg-biblio-navy text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold">William Blake Bibliography</h1>
          <p className="mt-2 text-biblio-lightBlue">
            An annotated bibliography of William Blake scholarship
          </p>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white shadow-sm rounded-md p-8 my-6">
            <h2 className="text-3xl font-bold text-biblio-navy mb-6">
              WILLIAM BLAKE: AN ANNOTATED BIBLIOGRAPHY
            </h2>
            
            <p className="text-lg mb-6">
              This is an updated version of G. E. Bentley, Jr.'s William Blake: 
              The Critical Heritage (London: Routledge, 1975) and Blake Books 
              (Oxford: Clarendon Press, 1977) and Blake Books Supplement (Oxford: 
              Clarendon Press, 1995), plus materials from Blake Books (2000) and Blake (2001, 2006).
            </p>
            
            <p className="mb-8">
              Edited by Jason Whittaker (2018, 2021, 2023) and produced by the 
              William Blake Archive with assistance from the Bibliography Team.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <Link to="/bibliography">
                <Button className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2 bg-biblio-navy hover:bg-biblio-navy/90">
                  <BookOpen size={24} />
                  <span>Browse Bibliography</span>
                </Button>
              </Link>
              
              <Link to="/about">
                <Button variant="outline" className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2 border-biblio-navy text-biblio-navy hover:bg-biblio-lightBlue/50">
                  <Info size={24} />
                  <span>About this Bibliography</span>
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-biblio-navy mb-4">Contents Overview</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART I. Teaching William Blake
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART II. Introductions & Handbooks
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART III. Editions of Blake's Writing
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART IV. Biographies
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART V. Bibliographies
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART VI. Catalogues
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART VII. Studies by Subject
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART VIII. Specific Works by Blake
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART IX. Collections of Essays
                </li>
                <li className="flex items-center gap-2">
                  <List size={16} className="text-biblio-navy" />
                  PART X. Appendices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-biblio-navy text-white py-4">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm">
          <p>William Blake Bibliography Navigator © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
