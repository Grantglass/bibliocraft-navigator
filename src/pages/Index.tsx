
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Info, Home } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { bibliographyEntries } from '@/data/bibliographyData';

const Index = () => {
  const [entryCount, setEntryCount] = useState<number>(0);
  const { toast } = useToast();
  
  // Use the prebuilt data directly
  useEffect(() => {
    // Get the count from the prebuilt data
    const count = bibliographyEntries.length;
    setEntryCount(count);
    
    // Show a welcome toast when the component mounts
    toast({
      title: "Welcome to Blake Bibliography",
      description: `Explore ${count.toLocaleString()} bibliography entries.`,
    });
  }, [toast]);

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
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-biblio-navy mb-4">Welcome to the Blake Bibliography</h3>
          <p className="text-biblio-gray mb-4">
            This resource provides scholars, students, and enthusiasts with access to a comprehensive 
            bibliography of William Blake's works and scholarly research about his art and poetry.
          </p>
          
          <div className="my-4 p-3 bg-biblio-lightBlue/20 rounded-md">
            <div className="text-center text-biblio-navy">
              {entryCount > 0 ? (
                <div>
                  <p className="mb-2">Access to {entryCount.toLocaleString()} bibliography entries.</p>
                  <Link to="/bibliography">
                    <Button size="sm" className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      Browse Bibliography
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Bibliography entries are loading...</p>
                </div>
              )}
            </div>
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
                Access bibliographic entries.
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
