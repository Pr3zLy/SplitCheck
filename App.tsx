import React, { useState, useEffect, useCallback, useRef } from 'react';
import FileUpload from './components/FileUpload';
import ItemEditor from './components/ItemEditor';
import PeopleAssigner from './components/PeopleAssigner';
import Loader from './components/Loader';
import ThemeSwitcher from './components/ThemeSwitcher';
import { RefreshIcon, HeroIllustration, UploadIcon } from './components/icons';
import { ReceiptItem, Person } from './types';
import { extractItemsFromReceipt } from './services/geminiService';
import ManualPeopleSetup from './components/ManualPeopleSetup';
import ManualItemEntry from './components/ManualItemEntry';

type AppState = 'idle' | 'loading' | 'editing' | 'assigning' | 'manual_people' | 'manual_entry';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('theme')) {
        return window.localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [appState, setAppState] = useState<AppState>('idle');
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isAppendingItems, setIsAppendingItems] = useState(false);
  const [appendError, setAppendError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const setDefaultPeople = useCallback(() => {
    setPeople([
        { id: crypto.randomUUID(), name: 'Persona 1', assignments: {} },
        { id: crypto.randomUUID(), name: 'Persona 2', assignments: {} }
    ]);
  }, []);


  const handleFileUpload = useCallback(async (file: File) => {
    setAppState('loading');
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setImageUrls([objectUrl]);

    try {
      const extractedItems = await extractItemsFromReceipt(file);
      setItems(extractedItems);
      setDefaultPeople();
      setAppState('editing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState('idle');
      URL.revokeObjectURL(objectUrl);
      setImageUrls([]);
    }
  }, [setDefaultPeople]);
  
  const handleAppendReceipt = useCallback(async (file: File) => {
    setIsAppendingItems(true);
    setAppendError(null);
    const objectUrl = URL.createObjectURL(file);
    try {
        const newItems = await extractItemsFromReceipt(file);
        setItems(prevItems => [...prevItems, ...newItems]);
        setImageUrls(prev => [...prev, objectUrl]);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Si è verificato un errore sconosciuto durante l\'aggiunta degli articoli.';
        setAppendError(errorMessage);
        URL.revokeObjectURL(objectUrl);
        setTimeout(() => setAppendError(null), 5000); // Auto-hide error
    } finally {
        setIsAppendingItems(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState('idle');
    setItems([]);
    setDefaultPeople();
    setError(null);
    if (imageUrls.length > 0) {
        imageUrls.forEach(url => URL.revokeObjectURL(url));
        setImageUrls([]);
    }
    setIsAppendingItems(false);
    setAppendError(null);
  }, [imageUrls, setDefaultPeople]);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (appState !== 'idle') return;

    const clipboardItems = event.clipboardData?.items;
    if (!clipboardItems) return;

    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith('image/')) {
        const file = clipboardItems[i].getAsFile();
        if (file) {
          event.preventDefault();
          handleFileUpload(file);
          break;
        }
      }
    }
  }, [appState, handleFileUpload]);

  const handleDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;
    if (appState === 'idle') {
      const hasFiles = Array.from(event.dataTransfer.items).some(item => item.kind === 'file' && item.type.startsWith('image/'));
      if (hasFiles) {
        setIsDraggingFile(true);
      }
    }
  }, [appState]);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingFile(false);
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current = 0;
    setIsDraggingFile(false);
    if (appState !== 'idle') return;

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      }
    }
  }, [appState, handleFileUpload]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragenter', handleDragEnter as any);
    window.addEventListener('dragover', handleDragOver as any);
    window.addEventListener('dragleave', handleDragLeave as any);
    window.addEventListener('drop', handleDrop as any);
    
    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragenter', handleDragEnter as any);
      window.removeEventListener('dragover', handleDragOver as any);
      window.removeEventListener('dragleave', handleDragLeave as any);
      window.removeEventListener('drop', handleDrop as any);
    };
  }, [handlePaste, handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);
  
  // Set default people on initial load
  useEffect(() => {
    setDefaultPeople();
  }, [setDefaultPeople]);

  
  // Cleanup object URL on component unmount
  useEffect(() => {
    return () => {
        if (imageUrls.length > 0) {
            imageUrls.forEach(url => URL.revokeObjectURL(url));
        }
    }
  }, [imageUrls]);


  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <Loader message="Analizzando lo scontrino con Gemini..." disclaimer="In base alla qualità della foto si potrebbero riscontrare imprecisioni nella trascrizione dello scontrino." />;
      case 'editing':
        return (
          <ItemEditor 
            items={items} 
            setItems={setItems} 
            onNext={() => {
              setAppState('assigning');
              window.scrollTo(0, 0);
            }}
            imageUrls={imageUrls}
            onAppendReceipt={handleAppendReceipt}
            isAppending={isAppendingItems}
            appendError={appendError}
          />
        );
      case 'assigning':
        return (
          <PeopleAssigner 
            items={items} 
            people={people} 
            setPeople={setPeople} 
            onBack={() => {
              setAppState('editing');
              window.scrollTo(0, 0);
            }}
          />
        );
       case 'manual_people':
        return (
          <ManualPeopleSetup
            people={people}
            setPeople={setPeople}
            onNext={() => {
              setAppState('manual_entry');
              window.scrollTo(0, 0);
            }}
            onBack={handleReset}
          />
        );
      case 'manual_entry':
        return (
          <ManualItemEntry
            items={items}
            setItems={setItems}
            people={people}
            setPeople={setPeople}
            onBack={() => {
              setItems([]); // Clear items when going back to people setup
              setAppState('manual_people');
              window.scrollTo(0, 0);
            }}
          />
        );
      case 'idle':
      default:
        return (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 animate-fade-in">
                <div className="md:w-1/2 lg:w-2/5 text-center md:text-left">
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">Scansiona, dividi, risolto.</h1>
                    <p className="text-lg text-muted-foreground mb-6">Dimentica la calcolatrice. Scatta una foto dello scontrino o inserisci gli articoli manualmente. L'app farà i conti per te.</p>
                    <p className="text-sm text-muted-foreground mb-8"><span className="font-semibold">Progetto 0-log:</span> la tua privacy è importante. Le immagini vengono elaborate all'istante e <span className="font-bold">mai</span> salvate.</p>
                     <div className="space-y-4">
                        <FileUpload onFileUpload={handleFileUpload} />
                        <div className="flex items-center gap-4">
                            <hr className="flex-grow border-border" />
                            <span className="text-sm text-muted-foreground">O</span>
                            <hr className="flex-grow border-border" />
                        </div>
                        <button 
                            onClick={() => setAppState('manual_people')}
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                        >
                            Inserisci Articoli Manualmente
                        </button>
                    </div>
                    {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
                </div>
                <div className="md:w-1/2 lg:w-3/5">
                    <HeroIllustration className="w-full h-auto max-w-lg mx-auto breathing-animation"/>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="bg-background text-foreground min-h-[100svh] flex flex-col">
       <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg mx-auto p-2 rounded-full border border-border/20 bg-background/60 backdrop-blur-xl shadow-lg z-50 glow-border header-animate">
            <div className="flex items-center justify-between w-full">
                <div className="w-24">
                    {appState !== 'idle' && (
                        <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Ricomincia da capo">
                            <RefreshIcon className="w-4 h-4" />
                            <span>Nuovo</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <img src="https://i.imgur.com/58P64X0.png" alt="SplitCheck Logo" className="w-8 h-8 rounded-full breathing-animation" />
                    <h1 className="text-lg font-bold">SplitCheck</h1>
                </div>

                <div className="w-24 flex justify-end">
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
      </header>
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full max-w-7xl flex flex-col pt-24 md:pt-28">
         <div className={`w-full flex-grow flex flex-col ${appState === 'idle' || appState === 'loading' ? 'justify-center' : 'justify-start pt-8'}`}>
            {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground mt-auto">
        Sviluppato da Matteo Abrugiato
      </footer>
      
      {isDraggingFile && appState === 'idle' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in pointer-events-none">
          <div className="p-12 border-4 border-dashed border-primary rounded-xl text-center">
            <UploadIcon className="w-20 h-20 text-primary mx-auto mb-4" />
            <p className="text-2xl font-bold text-primary">Rilascia l'immagine per iniziare</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
