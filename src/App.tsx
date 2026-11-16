/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Clock, 
  Sparkles, 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Heart, 
  Settings as SettingsIcon,
  CircleDot,
  LayoutGrid,
  ChevronRight,
  RefreshCcw,
  BookOpen
} from 'lucide-react';
import { cn } from './lib/utils';
import { getPrayerTimes, getSurahs } from './services/api';
import { PrayerTimes, HijriDate, Surah } from './types';

// Page Components (will extract to files later)
import Dashboard from './components/Dashboard';
import QuranReader from './components/QuranReader';
import DailyAzkar from './components/DailyAzkar';
import Tasbeeh from './components/Tasbeeh';
import Tools from './components/Tools';
import QuranReading from './components/QuranReading';

type Page = 'home' | 'quran' | 'reading' | 'azkar' | 'tasbeeh' | 'tools';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [pageHistory, setPageHistory] = useState<Page[]>(['home']);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [prayerData, setPrayerData] = useState<{ timings: PrayerTimes; date: HijriDate } | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quranSelection, setQuranSelection] = useState<{ surah: number; verse: number } | null>(null);

  const navigateTo = (page: Page) => {
    setActivePage(page);
    setPageHistory((prev) => {
      if (prev[prev.length - 1] === page) return prev;
      return [...prev, page];
    });
  };

  const handleGoBack = () => {
    setPageHistory((prev) => {
      if (prev.length > 1) {
        const nextHistory = prev.slice(0, -1);
        setActivePage(nextHistory[nextHistory.length - 1]);
        return nextHistory;
      }
      setActivePage('home');
      return ['home'];
    });
  };

  const handleOpenTools = () => {
    navigateTo('tools');
  };
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    const fallbackToMakkah = () => {
      setLocation({ lat: 21.4225, lng: 39.8262 });
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation unavailable, defaulting to Makkah:', error?.message || `code ${error?.code ?? 'unknown'}`);
          fallbackToMakkah();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    } else {
      fallbackToMakkah();
    }
    
    // Fetch Surahs ahead of time
    getSurahs().then(setSurahs);
  }, []);

  useEffect(() => {
    if (location) {
      getPrayerTimes(location.lat, location.lng).then((data) => {
        setPrayerData(data);
        setIsLoading(false);
      });
    }
  }, [location]);

  const navItems = {
    en: [
      { id: 'home', label: 'Home', icon: LayoutGrid },
      { id: 'quran', label: 'Quran', icon: BookOpen },
      { id: 'reading', label: 'Reading', icon: Book },
      { id: 'azkar', label: 'Deen Lab', icon: Sparkles },
      { id: 'tasbeeh', label: 'Tasbeeh', icon: CircleDot },
    ],
    ur: [
      { id: 'home', label: 'ہوم', icon: LayoutGrid },
      { id: 'quran', label: 'قرآن', icon: BookOpen },
      { id: 'reading', label: 'مطالعہ', icon: Book },
      { id: 'azkar', label: 'دین لیب', icon: Sparkles },
      { id: 'tasbeeh', label: 'تسبیح', icon: CircleDot },
    ]
  }[language];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-border-main">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full bg-accent-gold blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-border-main blur-3xl" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24 pt-4 px-4 relative z-10 scrollbar-hide">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             >
               <RefreshCcw className="w-8 h-8 text-accent-gold" />
             </motion.div>
             <p className="text-text-primary/60 font-serif italic text-sm">Seeking guidance...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, scale: 0.99, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {activePage === 'home' && (
                <Dashboard 
                  language={language} 
                  prayerData={prayerData} 
                  onOpenTools={handleOpenTools} 
                  onReadFullSurah={(surah, verse) => {
                    setQuranSelection({ surah, verse });
                    navigateTo('quran');
                  }}
                />
              )}
              {activePage === 'quran' && (
                <QuranReader 
                  surahs={surahs} 
                  language={language} 
                  initialSurahNumber={quranSelection?.surah} 
                  initialAyahNumber={quranSelection?.verse}
                  onOpenTools={handleOpenTools}
                  onBack={handleGoBack}
                />
              )}
              {activePage === 'reading' && <QuranReading language={language} onOpenTools={handleOpenTools} onBack={handleGoBack} />}
              {activePage === 'azkar' && <DailyAzkar language={language} onOpenTools={handleOpenTools} onBack={handleGoBack} />}
              {activePage === 'tasbeeh' && <Tasbeeh language={language} onOpenTools={handleOpenTools} onBack={handleGoBack} />}
              {activePage === 'tools' && <Tools language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} onBack={handleGoBack} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-bg-secondary shadow-[0_-10px_30px_rgba(0,0,0,0.5)] border-t border-border-main z-50 flex items-center justify-around px-6 py-4 rounded-t-3xl backdrop-blur-xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'quran' && activePage !== 'quran') {
                setQuranSelection(null);
              }
              navigateTo(item.id as Page);
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
              activePage === item.id ? "text-accent-gold" : "text-text-primary/40 hover:text-text-primary/70"
            )}
          >
            <item.icon className={cn("w-6 h-6", activePage === item.id && "scale-110")} />
            <span className="text-[10px] font-medium tracking-wide uppercase transition-all duration-300">
              {item.label}
            </span>
            {activePage === item.id && (
              <motion.div 
                layoutId="nav-glow"
                className="absolute -top-1 w-8 h-1 bg-accent-gold rounded-full blur-[2px]"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
