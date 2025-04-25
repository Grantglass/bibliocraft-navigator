import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Info, Home, Loader, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import PdfExtractor from '@/components/PdfExtractor';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [entryCount, setEntryCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [storageError, setStorageError] = useState<boolean>(false);
  const [quotaError, setQuotaError] = useState<boolean>(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const updateEntryCount = () => {
      try {
        const entryCountStr = sessionStorage.getItem('bibliographyEntryCount');
        if (entryCountStr) {
          const count = parseInt(entryCountStr);
          setEntryCount(count);
          setLoading(false);
          setStorageError(false);
          console.log("Index: Updated entry count from session storage:", count);
          
          // Show success toast only if we have a reasonable number of entries
          if (count > 0) {
            toast({
              title: "Bibliography Loaded",
              description: `Successfully loaded ${count} bibliography entries.`,
            });
          }
        } else {
          // If entries aren't available after 15 seconds, stop loading
          setTimeout(() => {
            if (loading) {
              setLoading(false);
              console.log("Index: No entries found after timeout, stopping loading state");
              
              // Show a toast message to alert the user
              toast({
                title: "Bibliography Not Found",
                description: "Bibliography data couldn't be loaded. Try refreshing the page.",
                variant: "destructive"
              });
            }
          }, 15000);
        }
      } catch (error) {
        console.error("Error reading from sessionStorage:", error);
        setLoading(false);
        setStorageError(true);
        
        toast({
          title: "Storage Error",
          description: "There was an error accessing browser storage. Try using a different browser.",
          variant: "destructive"
        });
      }
    };
    
    updateEntryCount();
    
    const handleBibliographyLoaded = (event: CustomEvent) => {
      const count = event.detail?.count || 0;
      console.log("Index: Bibliography loaded event received, count:", count);
      setEntryCount(count);
      setLoading(false);
      setRefreshing(false);
      setStorageError(false);
      
      // Show success toast only if we have entries
      if (count > 0) {
        toast({
          title: "Bibliography Loaded",
          description: `Successfully loaded ${count} bibliography entries.`,
        });
      } else {
        toast({
          title: "No Bibliography Entries",
          description: "No entries could be loaded. Try refreshing the page.",
          variant: "destructive"
        });
      }
    };
    
    const handleStorageExceeded = (event: CustomEvent) => {
      const entriesStored = event.detail?.entriesStored || 0;
      const totalEntries = event.detail?.totalEntries || 0;
      console.log(`Index: Storage quota exceeded. Stored ${entriesStored}/${totalEntries} entries`);
      
      setQuotaError(true);
      
      toast({
        title: "Storage Limit Reached",
        description: `Your browser could only store ${entriesStored} of ${totalEntries} entries due to storage limitations.`,
        variant: "destructive"
      });
    };
    
    window.addEventListener('bibliographyLoaded', handleBibliographyLoaded as EventListener);
    window.addEventListener('bibliographyStorageExceeded', handleStorageExceeded as EventListener);
    
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 15000);
    
    return () => {
      window.removeEventListener('bibliographyLoaded', handleBibliographyLoaded as EventListener);
      window.removeEventListener('bibliographyStorageExceeded', handleStorageExceeded as EventListener);
      clearTimeout(timeoutId);
    };
  }, [loading, toast]);

  const handleRefresh = () => {
    setRefreshing(true);
    setStorageError(false);
    setQuotaError(false);
    
    try {
      // Clear all existing bibliography data
      for (let i = 0; i < 100; i++) {
        sessionStorage.removeItem(`bibliographyEntries_${i}`);
      }
      sessionStorage.removeItem('bibliographyEntryCount');
      sessionStorage.removeItem('bibliographyChunkCount');
      sessionStorage.removeItem('bibliographySubheadings');
      
      console.log("Index: Cleared session storage, refreshing page...");
      
      // Show toast indicating refresh
      toast({
        title: "Refreshing Bibliography",
        description: "Clearing cache and reloading bibliography data...",
      });
      
      // Reload the page to trigger fresh extraction
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Error during refresh:", error);
      setRefreshing(false);
      
      // Show error toast
      toast({
        title: "Refresh Failed",
        description: "An error occurred while refreshing. Try again.",
        variant: "destructive"
      });
    }
  };

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
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-biblio-navy mb-4">Welcome to the Blake Bibliography</h3>
          <p className="text-biblio-gray mb-4">
            This resource provides scholars, students, and enthusiasts with access to a comprehensive 
            bibliography of over 1,700 entries covering William Blake's works and scholarly research about his art and poetry.
          </p>
          
          {(storageError || quotaError) && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {quotaError ? "Storage Limit Reached" : "Browser Storage Error"}
              </AlertTitle>
              <AlertDescription>
                {quotaError ? 
                  "Your browser's storage limit has been reached. Only a subset of bibliography entries could be loaded. Try using a different browser or clearing your browser data." :
                  "There was an error with browser storage. This might be due to private browsing mode or low storage space. Try refreshing the page or using a different browser."}
              </AlertDescription>
            </Alert>
          )}
          
          {(entryCount === 0 && !loading && !refreshing) && (
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Bibliography Not Available</AlertTitle>
              <AlertDescription>
                No bibliography entries could be loaded. This may be due to browser storage limitations or network issues.
                Please try refreshing the page or using a different browser.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="my-4 p-3 bg-biblio-lightBlue/20 rounded-md">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-biblio-navy">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Loading bibliography entries... This may take a moment</span>
              </div>
            ) : refreshing ? (
              <div className="flex items-center justify-center gap-2 text-biblio-navy">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Refreshing bibliography data...</span>
              </div>
            ) : (
              <div className="text-center text-biblio-navy">
                {entryCount > 0 ? (
                  <div>
                    <p className="mb-2">Successfully loaded {entryCount.toLocaleString()} bibliography entries.
                    {quotaError && " (Limited by browser storage capacity)"}
                    </p>
                    <div className="flex justify-center gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Refresh Data
                      </Button>
                      <Link to="/bibliography">
                        <Button size="sm" className="flex items-center gap-2">
                          <BookOpen className="h-3 w-3" />
                          Browse Bibliography
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">No bibliography entries found. Please refresh to load data.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 mt-2"
                      onClick={handleRefresh}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Load Bibliography Data
                    </Button>
                  </div>
                )}
              </div>
            )}
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
