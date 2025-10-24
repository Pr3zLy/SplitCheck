
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FileUpload from './components/FileUpload';
import ItemEditor from './components/ItemEditor';
import PeopleAssigner from './components/PeopleAssigner';
import Loader from './components/Loader';
import ThemeSwitcher from './components/ThemeSwitcher';
import { RefreshIcon, HeroIllustration, UploadIcon, GithubIcon } from './components/icons';
import { ReceiptItem, Person } from './types';
import { extractItemsFromReceipt } from './services/geminiService';
import ManualPeopleSetup from './components/ManualPeopleSetup';
import ManualItemEntry from './components/ManualItemEntry';

type AppState = 'idle' | 'loading' | 'editing' | 'assigning' | 'manual_people' | 'manual_entry';

const translations = {
  it: {
    appTitle: 'SplitCheck - Dividi il Conto',
    githubLink: 'Vedi il progetto su GitHub',
    scanSplitSolve: 'Scansiona, dividi, risolto.',
    tagline: "Dimentica la calcolatrice. Scatta una foto dello scontrino o inserisci gli articoli manualmente. L'app farà i conti per te.",
    privacy: 'Progetto 0-log:',
    privacyDetail: 'la tua privacy è importante. Le immagini vengono elaborate all\'istante e',
    privacyBold: 'mai',
    privacyDetailCont: 'salvate.',
    or: 'O',
    manualEntry: 'Inserisci Articoli Manualmente',
    new: 'Nuovo',
    developedBy: 'Sviluppato da Matteo Abrugiato',
    dropImage: "Rilascia l'immagine per iniziare",
    analyzingReceipt: 'Analizzando lo scontrino con Gemini...',
    photoDisclaimer: 'In base alla qualità della foto si potrebbero riscontrare imprecisioni nella trascrizione dello scontrino.',
  },
  en: {
    appTitle: 'SplitCheck - Split The Bill',
    githubLink: 'See the project on GitHub',
    scanSplitSolve: 'Scan, split, solved.',
    tagline: 'Forget the calculator. Snap a photo of the receipt or enter items manually. The app will do the math for you.',
    privacy: '0-log project:',
    privacyDetail: 'your privacy matters. Images are processed instantly and',
    privacyBold: 'never',
    privacyDetailCont: 'saved.',
    or: 'OR',
    manualEntry: 'Enter Items Manually',
    new: 'New',
    developedBy: 'Developed by Matteo Abrugiato',
    dropImage: 'Drop the image to start',
    analyzingReceipt: 'Analyzing receipt with Gemini...',
    photoDisclaimer: 'Based on the photo quality, there may be inaccuracies in the receipt transcription.',
  },
};

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

  const [language, setLanguage] = useState<'it' | 'en'>(() => {
    if (typeof window !== 'undefined') {
        const storedLang = window.localStorage.getItem('language');
        if (storedLang === 'it' || storedLang === 'en') {
            return storedLang;
        }
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'it') {
            return 'it';
        }
    }
    return 'en';
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

  const t = translations[language];

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.title = t.appTitle;
  }, [language, t]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const setDefaultPeople = useCallback(() => {
    const person1 = language === 'it' ? 'Persona 1' : 'Person 1';
    const person2 = language === 'it' ? 'Persona 2' : 'Person 2';
    setPeople([
        { id: crypto.randomUUID(), name: person1, assignments: {} },
        { id: crypto.randomUUID(), name: person2, assignments: {} }
    ]);
  }, [language]);


  const handleFileUpload = useCallback(async (file: File) => {
    setAppState('loading');
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setImageUrls([objectUrl]);

    try {
      const extractedItems = await extractItemsFromReceipt(file, language);
      setItems(extractedItems);
      setDefaultPeople();
      setAppState('editing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState('idle');
      URL.revokeObjectURL(objectUrl);
      setImageUrls([]);
    }
  }, [setDefaultPeople, language]);
  
  const handleAppendReceipt = useCallback(async (file: File) => {
    setIsAppendingItems(true);
    setAppendError(null);
    const objectUrl = URL.createObjectURL(file);
    try {
        const newItems = await extractItemsFromReceipt(file, language);
        setItems(prevItems => [...prevItems, ...newItems]);
        setImageUrls(prev => [...prev, objectUrl]);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : (language === 'it' ? 'Si è verificato un errore sconosciuto durante l\'aggiunta degli articoli.' : 'An unknown error occurred while adding items.');
        setAppendError(errorMessage);
        URL.revokeObjectURL(objectUrl);
        setTimeout(() => setAppendError(null), 5000); // Auto-hide error
    } finally {
        setIsAppendingItems(false);
    }
  }, [language]);

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

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <Loader message={t.analyzingReceipt} disclaimer={t.photoDisclaimer} />;
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
            language={language}
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
            language={language}
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
            language={language}
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
            language={language}
          />
        );
      case 'idle':
      default:
        return (
            <div className="flex flex-col items-center justify-center animate-fade-in">
                 <a
                    href="https://github.com/Pr3zLy/SplitCheck"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-card/50 border border-border px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 mb-8 transition-all shadow-sm"
                >
                    <GithubIcon className="w-4 h-4" />
                    <span>{t.githubLink}</span>
                </a>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full">
                    <div className="md:w-1/2 lg:w-2/5 text-center md:text-left">
                        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">{t.scanSplitSolve}</h1>
                        <p className="text-lg text-muted-foreground mb-6">{t.tagline}</p>
                        <p className="text-sm text-muted-foreground mb-8"><span className="font-semibold">{t.privacy}</span> {t.privacyDetail} <span className="font-bold">{t.privacyBold}</span> {t.privacyDetailCont}</p>
                        <div className="space-y-4">
                            <FileUpload onFileUpload={handleFileUpload} language={language} />
                            <div className="flex items-center gap-4">
                                <hr className="flex-grow border-border" />
                                <span className="text-sm text-muted-foreground">{t.or}</span>
                                <hr className="flex-grow border-border" />
                            </div>
                            <button 
                                onClick={() => setAppState('manual_people')}
                                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                            >
                                {t.manualEntry}
                            </button>
                        </div>
                        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
                    </div>
                    <div className="md:w-1/2 lg:w-3/5">
                        <HeroIllustration className="w-full h-auto max-w-lg mx-auto breathing-animation"/>
                    </div>
                </div>
            </div>
        );
    }
  };
  
  const LanguageSwitcher = () => (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
        <button 
            onClick={() => setLanguage('it')} 
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'it' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
            IT
        </button>
        <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
            EN
        </button>
    </div>
  );

  return (
    <div className="bg-background text-foreground min-h-[100svh] flex flex-col">
       <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl mx-auto p-2 rounded-full border border-border/20 bg-background/60 backdrop-blur-xl shadow-lg z-50 glow-border header-animate">
            <div className="flex items-center justify-between w-full">
                <div className="flex-1 flex justify-start items-center gap-2">
                    {appState !== 'idle' && (
                        <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Ricomincia da capo">
                            <RefreshIcon className="w-4 h-4" />
                            <span>{t.new}</span>
                        </button>
                    )}
                    <LanguageSwitcher />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <img src="https://i.imgur.com/58P64X0.png" alt="SplitCheck Logo" className="w-8 h-8 rounded-full breathing-animation" />
                    <h1 className="text-lg font-bold">SplitCheck</h1>
                </div>

                <div className="flex-1 flex justify-end items-center">
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} language={language} />
                </div>
            </div>
      </header>
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full max-w-7xl flex flex-col pt-24 md:pt-28">
         <div className={`w-full flex-grow flex flex-col ${appState === 'idle' || appState === 'loading' ? 'justify-center' : 'justify-start pt-8'}`}>
            {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground mt-auto">
        {t.developedBy}
      </footer>
      
      {isDraggingFile && appState === 'idle' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in pointer-events-none">
          <div className="p-12 border-4 border-dashed border-primary rounded-xl text-center">
            <UploadIcon className="w-20 h-20 text-primary mx-auto mb-4" />
            <p className="text-2xl font-bold text-primary">{t.dropImage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
