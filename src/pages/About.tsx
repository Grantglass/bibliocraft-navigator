
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen bg-biblio-lightBlue">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-md my-6 mx-4 md:mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Bibliography
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-biblio-navy mb-6">WILLIAM BLAKE: AN ANNOTATED BIBLIOGRAPHY</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg mb-4">
            This is an updated version of G. E. Bentley, Jr.'s William Blake: 
            The Critical Heritage (London: Routledge, 1975) and Blake Books 
            (Oxford: Clarendon Press, 1977) and Blake Books Supplement (Oxford: 
            Clarendon Press, 1995), plus materials from Blake Books (2000) and Blake (2001, 2006).
          </p>
          
          <p className="mb-4">
            Edited by Jason Whittaker (2018, 2021, 2023) and produced by the 
            William Blake Archive with assistance from the Bibliography Team.
          </p>
          
          <div className="mt-8 text-biblio-gray">
            <p className="italic">Contents</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>User Note</li>
              <li>Abbreviations</li>
              <li>PART I. TEACHING WILLIAM BLAKE</li>
              <li>PART II. GENERAL INTRODUCTIONS, HANDBOOKS, GLOSSARIES, AND CLASSIC STUDIES</li>
              <li>PART III. EDITIONS OF BLAKE'S WRITING</li>
              <li>PART IV. BIOGRAPHIES</li>
              <li>PART V. BIBLIOGRAPHIES</li>
              <li>PART VI. CATALOGUES</li>
              <li>PART VII. STUDIES OF BLAKE ARRANGED BY SUBJECT</li>
              <li>PART VIII. SPECIFIC WORKS BY BLAKE</li>
              <li>PART IX. COLLECTIONS OF ESSAYS ON BLAKE</li>
              <li>PART X. APPENDICES</li>
            </ul>
            
            <p className="mt-4 text-sm">
              For a complete table of contents with all the subheadings, 
              navigate through the sidebar in the main bibliography view.
            </p>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-biblio-navy mb-3">User Note</h2>
            <p>
              This bibliography is a comprehensive resource for William Blake scholarship. 
              It contains thousands of entries organized by categories and subheadings to 
              facilitate research on Blake's art, poetry, and influence.
            </p>
            
            <h2 className="text-xl font-semibold text-biblio-navy mt-6 mb-3">Abbreviations</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
              <li><strong>BB</strong> - Blake Books</li>
              <li><strong>BBS</strong> - Blake Books Supplement</li>
              <li><strong>WBHC</strong> - William Blake: The Critical Heritage</li>
              <li><strong>WBA</strong> - William Blake Archive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
