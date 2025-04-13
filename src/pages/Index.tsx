import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Info, Home, Loader } from 'lucide-react';
import PdfExtractor from '@/components/PdfExtractor';

const Index = () => {
  const [entryCount, setEntryCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const updateEntryCount = () => {
      try {
        const storedEntries = sessionStorage.getItem('bibliographyEntries');
        if (storedEntries) {
          const entries = JSON.parse(storedEntries);
          setEntryCount(entries.length);
          setLoading(false);
          console.log("Index: Updated entry count from session storage:", entries.length);
        }
      } catch (error) {
        console.error("Error reading from sessionStorage:", error);
      }
    };
    
    updateEntryCount();
    
    const handleBibliographyLoaded = (event: CustomEvent) => {
      const count = event.detail?.count || 0;
      console.log("Index: Bibliography loaded event received, count:", count);
      setEntryCount(count);
      setLoading(false);
    };
    
    window.addEventListener('bibliographyLoaded', handleBibliographyLoaded as EventListener);
    
    const timeoutId = setTimeout(() => {
      if (entryCount === 0) {
        console.log("Index: Checking entry count again after timeout");
        updateEntryCount();
      }
    }, 5000);
    
    return () => {
      window.removeEventListener('bibliographyLoaded', handleBibliographyLoaded as EventListener);
      clearTimeout(timeoutId);
    };
  }, [entryCount]);

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
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mb-12">
          <h3 className="text-xl font-semibold text-biblio-navy mb-4">Welcome to the Blake Bibliography</h3>
          <p className="text-biblio-gray mb-4">
            This resource provides scholars, students, and enthusiasts with access to a comprehensive 
            bibliography of over 1,700 entries covering William Blake's works and scholarly research about his art and poetry.
          </p>
          
          <div className="my-4 p-3 bg-biblio-lightBlue/20 rounded-md">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-biblio-navy">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Loading bibliography entries...</span>
              </div>
            ) : (
              <p className="text-center text-biblio-navy">
                {entryCount > 0 ? (
                  <span>Successfully loaded {entryCount.toLocaleString()} bibliography entries.</span>
                ) : (
                  <span>Preparing bibliography data...</span>
                )}
              </p>
            )}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Link to="/bibliography">
              <Button className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Complete Bibliography
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mt-12">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>About William Blake</CardTitle>
              <CardDescription>
                Learn about the poet, painter, and printmaker.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-biblio-gray">
                William Blake (1757-1827) was an English poet, painter, and printmaker who created some of 
                the most iconic images in British art and deeply influenced the visual and literary arts.
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
          
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Scholarly Resources</CardTitle>
              <CardDescription>
                Access over 1,700 bibliographic entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-biblio-gray">
                Browse our extensive collection of bibliographic entries including critical works, 
                biographies, scholarly articles, and primary sources related to William Blake.
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
