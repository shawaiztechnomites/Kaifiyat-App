import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Book, ChevronLeft, Volume2, Pause, Menu, WifiOff, RefreshCcw } from 'lucide-react';
import { Ayah } from '../types';
import { getJuzDetail } from '../services/api';
import { cn } from '../lib/utils';

interface Props {
  language: 'en' | 'ur';
  onOpenTools: () => void;
  onBack: () => void;
}

const VERSE_PAGE_SIZE = 25;

export default function QuranReading({ language, onOpenTools, onBack }: Props) {
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(VERSE_PAGE_SIZE);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const t = {
    en: {
      title: 'Complete Quran',
      sub: 'Read by Para / Juz',
      loading: 'Loading Para...',
      back: 'Back to List',
      para: 'Para',
      tapToRead: 'Tap to start reading with translation'
    },
    ur: {
      title: 'مکمل قرآن مجید',
      sub: 'پارہ وار مطالعہ',
      loading: 'لوڈنگ ہو رہی ہے...',
      back: 'فہرست پر واپس جائیں',
      para: 'پارہ',
      tapToRead: 'اردو ترجمہ کے ساتھ پڑھنے کیلئے منتخب کریں'
    }
  }[language];

  const loadJuz = useCallback(async (juzNumber: number, lang: 'en' | 'ur') => {
    setIsLoading(true);
    setHasError(false);
    setVisibleCount(VERSE_PAGE_SIZE);
    try {
      const data = await getJuzDetail(juzNumber, lang);
      setAyahs(data);
      setHasError(false);
    } catch {
      setAyahs([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedJuz) {
      loadJuz(selectedJuz, language);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedJuz, language, loadJuz]);

  const visibleAyahs = useMemo(
    () => ayahs.slice(0, visibleCount),
    [ayahs, visibleCount]
  );

  useEffect(() => {
    if (!selectedJuz || isLoading || visibleCount >= ayahs.length) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => Math.min(ayahs.length, prev + VERSE_PAGE_SIZE));
        }
      },
      { rootMargin: '250px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedJuz, isLoading, visibleCount, ayahs.length]);

  const handlePlayAudio = (ayah: Ayah) => {
    if (!ayah.audio) return;

    if (playingAyah === ayah.number) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();

    try {
      const audio = new Audio(ayah.audio);
      audioRef.current = audio;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        setPlayingAyah(ayah.number);
        playPromise.catch(() => setPlayingAyah(null));
      }

      audio.onended = () => setPlayingAyah(null);
      audio.onerror = () => setPlayingAyah(null);
    } catch {
      setPlayingAyah(null);
    }
  };

  if (selectedJuz) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  setPlayingAyah(null);
                }
                setSelectedJuz(null);
              }}
              className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className={cn("text-xl font-bold text-accent-gold", language === 'ur' && "urdu-text")}>
                {t.para} {selectedJuz}
              </h2>
              <p className="text-[10px] text-text-primary/40 uppercase tracking-widest font-bold">
                {language === 'ur' ? 'اردو ترجمہ' : 'English Translation'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTools}
            aria-label="Open menu"
            className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
            <p className={cn("text-accent-gold/60 text-sm italic", language === 'ur' && "urdu-text")}>{t.loading}</p>
          </div>
        ) : hasError || ayahs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
            <WifiOff className="w-10 h-10 text-accent-gold/60" />
            <p className={cn("text-text-primary/60 text-sm", language !== 'ur' && "font-sans")}>
              {language === 'ur'
                ? 'مواد لوڈ کرنے میں مسئلہ ہوا۔ براہ کرم انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔'
                : 'Unable to load Para. Please check your internet connection and try again.'}
            </p>
            <button
              onClick={() => loadJuz(selectedJuz, language)}
              className="px-5 py-2.5 rounded-xl bg-accent-gold text-bg-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'دوبارہ کوشش کریں' : 'Retry'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8 pb-10 overflow-y-auto">
            {visibleAyahs.map((ayah) => (
              <div
                key={ayah.number}
                className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold text-[10px] font-mono font-bold border border-accent-gold/20">
                    {ayah.numberInSurah}
                  </span>
                  {ayah.audio && (
                    <button
                      onClick={() => handlePlayAudio(ayah)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        playingAyah === ayah.number ? "bg-accent-gold text-bg-primary" : "text-accent-gold hover:bg-accent-gold/10"
                      )}
                    >
                      {playingAyah === ayah.number ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <p className="arabic-text text-2xl text-text-primary mb-6 leading-[2.5] text-right">
                  {ayah.text}
                </p>

                <div className="h-px w-1/4 bg-accent-gold/10 mx-auto mb-6" />

                <p className={cn(
                  "text-lg text-text-primary/80 leading-[2]",
                  language === 'ur' ? "urdu-text text-right" : "font-sans text-left"
                )}>
                  {ayah.translation}
                </p>
              </div>
            ))}

            {visibleCount < ayahs.length && (
              <div ref={sentinelRef} className="py-4 text-center">
                <button
                  onClick={() => setVisibleCount(prev => Math.min(ayahs.length, prev + VERSE_PAGE_SIZE))}
                  className="px-5 py-2.5 glass-card rounded-xl text-xs font-bold uppercase tracking-wider text-accent-gold"
                >
                  {language === 'ur'
                    ? `مزید آیات لوڈ کریں (${ayahs.length - visibleCount})`
                    : `Load More Verses (${ayahs.length - visibleCount} remaining)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className={cn("text-2xl font-bold mb-1 tracking-tight uppercase", language === 'ur' ? "urdu-text" : "font-sans text-accent-gold")}>
              {t.title}
            </h2>
            <p className="text-text-primary/40 text-[10px] uppercase tracking-widest font-bold">{t.sub}</p>
          </div>
        </div>
        <button
          onClick={onOpenTools}
          aria-label="Open menu"
          className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 pb-10">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((para) => (
          <button
            key={para}
            onClick={() => setSelectedJuz(para)}
            className="glass-card p-5 rounded-3xl text-left space-y-3 group hover:border-accent-gold/30 transition-transform active:scale-[0.98] border-accent-gold/5"
          >
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-2xl bg-accent-gold/10 flex items-center justify-center text-accent-gold transition-colors group-hover:bg-accent-gold group-hover:text-bg-primary">
                <Book className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-text-primary/20">{para.toString().padStart(2, '0')}</span>
            </div>
            <div>
              <h3 className={cn("text-sm font-bold text-text-primary", language === 'ur' && "urdu-text")}>
                {t.para} {para}
              </h3>
              <p className="text-[9px] text-text-primary/30 uppercase tracking-tighter leading-tight mt-1">
                {language === 'ur' ? 'مکمل تلاوت و ترجمہ' : 'Full Recitation & Translation'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
