/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Book,
  Sparkles,
  CircleDot,
  LayoutGrid,
  RefreshCcw,
  BookOpen,
  WifiOff
} from 'lucide-react';
import { cn } from './lib/utils';
import {
  getPrayerTimes,
  getSurahs,
  getCachedPrayerTimes,
  getCachedSurahs,
  PrayerData
} from './services/api';
import { Surah } from './types';

import Dashboard from './components/Dashboard';

const QuranReader = lazy(() => import('./components/QuranReader'));
const QuranReading = lazy(() => import('./components/QuranReading'));
const DailyAzkar = lazy(() => import('./components/DailyAzkar'));
const Tasbeeh = lazy(() => import('./components/Tasbeeh'));
const Tools = lazy(() => import('./components/Tools'));

type Page = 'home' | 'quran' | 'reading' | 'azkar' | 'tasbeeh' | 'tools';

const PageFallback = () => (
  <div className="h-64 flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [pageHistory, setPageHistory] = useState<Page[]>(['home']);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(() => getCachedPrayerTimes());
  const [prayerError, setPrayerError] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>(() => getCachedSurahs());
  const [isSurahsLoading, setIsSurahsLoading] = useState<boolean>(() => getCachedSurahs().length === 0);
  const [surahsError, setSurahsError] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(() => getCachedPrayerTimes() === null);
  const [quranSelection, setQuranSelection] = useState<{ surah: number; verse: number } | null>(null);

  const navigateTo = useCallback((page: Page) => {
    setActivePage(page);
    setPageHistory((prev) => {
      if (prev[prev.length - 1] === page) return prev;
      return [...prev, page];
    });
  }, []);

  const handleGoBack = useCallback(() => {
    setPageHistory((prev) => {
      if (prev.length > 1) {
        const nextHistory = prev.slice(0, -1);
        setActivePage(nextHistory[nextHistory.length - 1]);
        return nextHistory;
      }
      setActivePage('home');
      return ['home'];
    });
  }, []);

  const handleOpenTools = useCallback(() => {
    navigateTo('tools');
  }, [navigateTo]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const loadSurahs = useCallback(async () => {
    setSurahsError(false);
    if (surahs.length === 0) {
      setIsSurahsLoading(true);
    }
    try {
      const list = await getSurahs();
      setSurahs(list);
      setSurahsError(false);
    } catch {
      if (getCachedSurahs().length === 0) {
        setSurahsError(true);
      }
    } finally {
      setIsSurahsLoading(false);
    }
  }, [surahs.length]);

  const loadPrayerTimes = useCallback(async (lat: number, lng: number) => {
    setPrayerError(false);
    try {
      const data = await getPrayerTimes(lat, lng);
      setPrayerData(data);
      setPrayerError(false);
    } catch {
      if (!getCachedPrayerTimes()) {
        setPrayerError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        () => {
          fallbackToMakkah();
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    } else {
      fallbackToMakkah();
    }

    loadSurahs();
  }, [loadSurahs]);

  useEffect(() => {
    if (location) {
      loadPrayerTimes(location.lat, location.lng);
    }
  }, [location, loadPrayerTimes]);

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
    <div className="min-h-screen bg-bg-primary flex flex-col max-w-md mx-auto relative overflow-hidden shadow-md border-x border-border-main">
      {/* Lightweight Background Decor (no expensive blur-3xl pass) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--border-main) 0%, transparent 70%)' }}
        />
      </div>

      <main className="flex-1 overflow-y-auto pb-24 pt-4 px-4 relative z-10 scrollbar-hide">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <RefreshCcw className="w-8 h-8 text-accent-gold animate-spin" />
            <p className="text-text-primary/60 font-serif italic text-sm">
              {language === 'ur' ? 'لوڈنگ ہو رہی ہے...' : 'Seeking guidance...'}
            </p>
          </div>
        ) : (
          <div className="h-full">
            {activePage === 'home' && (
              prayerData ? (
                <Dashboard
                  language={language}
                  prayerData={prayerData}
                  onOpenTools={handleOpenTools}
                  onReadFullSurah={(surah, verse) => {
                    setQuranSelection({ surah, verse });
                    navigateTo('quran');
                  }}
                />
              ) : prayerError ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <WifiOff className="w-10 h-10 text-accent-gold/60" />
                  <p className="text-sm text-text-primary/70">
                    {language === 'ur'
                      ? 'انٹرنیٹ دستیاب نہیں ہے۔ براہ کرم کنکشن چیک کر کے دوبارہ کوشش کریں۔'
                      : 'Unable to load prayer times. Please check your internet connection.'}
                  </p>
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      const coords = location || { lat: 21.4225, lng: 39.8262 };
                      loadPrayerTimes(coords.lat, coords.lng);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-accent-gold text-bg-primary text-xs font-bold uppercase tracking-wider"
                  >
                    {language === 'ur' ? 'دوبارہ کوشش کریں' : 'Retry'}
                  </button>
                </div>
              ) : null
            )}

            <Suspense fallback={<PageFallback />}>
              {activePage === 'quran' && (
                <QuranReader
                  surahs={surahs}
                  isSurahsLoading={isSurahsLoading}
                  surahsError={surahsError}
                  onRetrySurahs={loadSurahs}
                  language={language}
                  initialSurahNumber={quranSelection?.surah}
                  initialAyahNumber={quranSelection?.verse}
                  onOpenTools={handleOpenTools}
                  onBack={handleGoBack}
                />
              )}
              {activePage === 'reading' && (
                <QuranReading
                  language={language}
                  onOpenTools={handleOpenTools}
                  onBack={handleGoBack}
                />
              )}
              {activePage === 'azkar' && (
                <DailyAzkar
                  language={language}
                  onOpenTools={handleOpenTools}
                  onBack={handleGoBack}
                />
              )}
              {activePage === 'tasbeeh' && (
                <Tasbeeh
                  language={language}
                  onOpenTools={handleOpenTools}
                  onBack={handleGoBack}
                />
              )}
              {activePage === 'tools' && (
                <Tools
                  language={language}
                  setLanguage={setLanguage}
                  theme={theme}
                  setTheme={setTheme}
                  onBack={handleGoBack}
                />
              )}
            </Suspense>
          </div>
        )}
      </main>

      {/* Bottom Navigation (no backdrop-blur-xl for smooth WebView scrolling) */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-bg-secondary shadow-[0_-4px_14px_rgba(0,0,0,0.3)] border-t border-border-main z-50 flex items-center justify-around px-6 py-4 rounded-t-3xl">
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
              "flex flex-col items-center gap-1.5 transition-colors duration-150 relative",
              activePage === item.id ? "text-accent-gold" : "text-text-primary/40 hover:text-text-primary/70"
            )}
          >
            <item.icon className={cn("w-6 h-6", activePage === item.id && "scale-105")} />
            <span className="text-[10px] font-medium tracking-wide uppercase">
              {item.label}
            </span>
            {activePage === item.id && (
              <div className="absolute -top-1 w-8 h-1 bg-accent-gold rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
