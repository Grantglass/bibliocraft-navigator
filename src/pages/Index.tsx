
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Info, Home } from 'lucide-react';
import PdfExtractor from '@/components/PdfExtractor';

const Index = () => {
  return (
    <div className="min-h-screen bg-biblio-lightBlue">
      <header className="bg-biblio-navy text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">William Blake Bibliography</h1>
          <nav className="flex space-x-4">
            <Link to="/" className="hover:text-biblio-lightBlue flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link to="/bibliography" className="hover:text-biblio-lightBlue flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Bibliography</span>
            </Link>
            <Link to="/about" className="hover:text-biblio-lightBlue flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-biblio-navy mb-4">
            William Blake Bibliography Navigator
          </h2>
          <p className="text-lg text-biblio-gray max-w-3xl mx-auto">
            Explore the comprehensive bibliography of William Blake's works, 
            critical analyses, and scholarly research.
          </p>
        </div>
        
        <PdfExtractor />
        
        <div className="flex flex-col md:flex-row gap-6 mt-12">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Browse Bibliography</CardTitle>
              <CardDescription>
                Explore the full bibliography organized by categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-biblio-gray">
                Navigate through hundreds of bibliographic entries categorized by chapter, 
                subheading, and topic.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/bibliography">
                <Button className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Browse Bibliography
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
              <CardDescription>
                Learn more about the William Blake Bibliography project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-biblio-gray">
                Discover the purpose, history, and methodology behind this 
                comprehensive bibliographic resource.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/about">
                <Button variant="outline" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  About Page
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="bg-biblio-navy text-white p-6 mt-12">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} William Blake Bibliography Project</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
