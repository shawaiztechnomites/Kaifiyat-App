import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, Volume2, Bookmark, Share2, Pause, Menu, WifiOff, RefreshCcw } from 'lucide-react';
import { Surah, Ayah } from '../types';
import { getSurahDetail } from '../services/api';
import { cn } from '../lib/utils';

interface Props {
  surahs: Surah[];
  isSurahsLoading?: boolean;
  surahsError?: boolean;
  onRetrySurahs?: () => void;
  language: 'en' | 'ur';
  initialSurahNumber?: number | null;
  initialAyahNumber?: number | null;
  onOpenTools: () => void;
  onBack: () => void;
}

const SURAH_PAGE_SIZE = 30;
const VERSE_PAGE_SIZE = 25;

export default function QuranReader({
  surahs,
  isSurahsLoading = false,
  surahsError = false,
  onRetrySurahs,
  language,
  initialSurahNumber,
  initialAyahNumber,
  onOpenTools,
  onBack
}: Props) {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [visibleSurahCount, setVisibleSurahCount] = useState(SURAH_PAGE_SIZE);
  const [visibleVerseCount, setVisibleVerseCount] = useState(VERSE_PAGE_SIZE);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const surahSentinelRef = useRef<HTMLDivElement | null>(null);
  const verseSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialSurahNumber) {
      const surah = surahs.find(s => s.number === initialSurahNumber);
      if (surah) {
        setSelectedSurah(surah);
      }
    }
  }, [initialSurahNumber, surahs]);

  const loadSurahVerses = useCallback(async (surahNumber: number, lang: 'en' | 'ur') => {
    setIsLoadingDetail(true);
    setDetailError(false);
    setVisibleVerseCount(
      initialAyahNumber ? Math.max(VERSE_PAGE_SIZE, initialAyahNumber + 10) : VERSE_PAGE_SIZE
    );

    try {
      const data = await getSurahDetail(surahNumber, lang);
      setAyahs(data);
      setDetailError(false);

      if (initialAyahNumber) {
        setTimeout(() => {
          const verseEl = verseRefs.current[initialAyahNumber];
          if (verseEl) {
            verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 120);
      }
    } catch {
      setAyahs([]);
      setDetailError(true);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [initialAyahNumber]);

  useEffect(() => {
    if (selectedSurah) {
      loadSurahVerses(selectedSurah.number, language);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedSurah, language, loadSurahVerses]);

  useEffect(() => {
    setVisibleSurahCount(SURAH_PAGE_SIZE);
  }, [searchQuery]);

  const filteredSurahs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(s =>
      s.englishName.toLowerCase().includes(q) ||
      s.name.includes(searchQuery) ||
      String(s.number) === q
    );
  }, [surahs, searchQuery]);

  const visibleSurahs = useMemo(
    () => filteredSurahs.slice(0, visibleSurahCount),
    [filteredSurahs, visibleSurahCount]
  );

  const visibleAyahs = useMemo(
    () => ayahs.slice(0, visibleVerseCount),
    [ayahs, visibleVerseCount]
  );

  // Progressive auto-load for 114 Surahs
  useEffect(() => {
    if (selectedSurah || visibleSurahCount >= filteredSurahs.length) return;
    const el = surahSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleSurahCount(prev => Math.min(filteredSurahs.length, prev + SURAH_PAGE_SIZE));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedSurah, visibleSurahCount, filteredSurahs.length]);

  // Progressive auto-load for verses inside long Surahs
  useEffect(() => {
    if (!selectedSurah || isLoadingDetail || visibleVerseCount >= ayahs.length) return;
    const el = verseSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleVerseCount(prev => Math.min(ayahs.length, prev + VERSE_PAGE_SIZE));
        }
      },
      { rootMargin: '250px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedSurah, isLoadingDetail, visibleVerseCount, ayahs.length]);

  const handlePlayAudio = (ayah: Ayah) => {
    if (!ayah.audio) return;

    if (playingAyah === ayah.number) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const audio = new Audio(ayah.audio);
      audioRef.current = audio;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        setPlayingAyah(ayah.number);
        playPromise.catch(() => {
          setPlayingAyah(null);
        });
      }

      audio.onended = () => setPlayingAyah(null);
      audio.onerror = () => setPlayingAyah(null);
    } catch {
      setPlayingAyah(null);
    }
  };

  if (selectedSurah) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between sticky top-0 bg-bg-primary py-2 z-20 border-b border-border-main/30">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                setPlayingAyah(null);
              }
              setSelectedSurah(null);
            }}
            className="p-2 glass-card rounded-xl text-accent-gold hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-sans font-bold text-accent-gold tracking-tight">{selectedSurah.englishName}</h2>
          </div>
          <button
            onClick={onOpenTools}
            aria-label="Open menu"
            className="p-2.5 glass-card rounded-xl text-accent-gold hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {isLoadingDetail ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-text-primary/50">
              {language === 'ur' ? 'سورت لوڈ ہو رہی ہے...' : 'Loading Surah...'}
            </p>
          </div>
        ) : detailError ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <WifiOff className="w-10 h-10 text-accent-gold/60" />
            <p className="text-sm text-text-primary/70">
              {language === 'ur'
                ? 'سورت لوڈ نہیں ہو سکی۔ براہ کرم اپنا انٹرنیٹ چیک کریں۔'
                : 'Unable to load Surah verses. Please check your internet connection.'}
            </p>
            <button
              onClick={() => loadSurahVerses(selectedSurah.number, language)}
              className="px-5 py-2.5 rounded-xl bg-accent-gold text-bg-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'دوبارہ کوشش کریں' : 'Retry'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            {selectedSurah.number !== 1 && (
              <div className="text-center py-8">
                <p className="arabic-text text-3xl text-text-primary">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              </div>
            )}

            {visibleAyahs.map((ayah) => (
              <div
                key={ayah.number}
                ref={(el: HTMLDivElement | null) => { verseRefs.current[ayah.numberInSurah] = el; }}
                className={cn(
                  "p-6 glass-card rounded-3xl border-accent-gold/5 relative group",
                  initialAyahNumber === ayah.numberInSurah ? "ring-2 ring-accent-gold bg-accent-gold/5" : "bg-bg-secondary/20"
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-gold/10 text-accent-gold text-xs font-bold font-mono border border-accent-gold/20">
                      {ayah.numberInSurah}
                    </span>
                    <div className="flex gap-2">
                      {ayah.audio && (
                        <button
                          onClick={() => handlePlayAudio(ayah)}
                          className={cn(
                            "p-1.5 transition-colors",
                            playingAyah === ayah.number ? "text-accent-gold" : "text-text-primary/20 hover:text-accent-gold"
                          )}
                        >
                          {playingAyah === ayah.number ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      )}
                      <button className="p-1.5 text-text-primary/20 hover:text-accent-gold transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button className="p-1.5 text-text-primary/20 hover:text-accent-gold transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="arabic-text text-2xl lg:text-3xl text-text-primary leading-[2.5] text-right mb-6" dir="rtl">
                  {ayah.text}
                </p>

                <div className="h-px w-1/4 bg-accent-gold/10 mx-auto mb-6" />

                <p className={cn(
                  "text-text-primary/80 text-sm leading-relaxed",
                  language === 'ur' ? "urdu-text text-xl text-right leading-[2]" : "font-sans italic text-left"
                )}>
                  {ayah.translation}
                </p>
              </div>
            ))}

            {visibleVerseCount < ayahs.length && (
              <div ref={verseSentinelRef} className="py-4 text-center">
                <button
                  onClick={() => setVisibleVerseCount(prev => Math.min(ayahs.length, prev + VERSE_PAGE_SIZE))}
                  className="px-5 py-2.5 glass-card rounded-xl text-xs font-bold uppercase tracking-wider text-accent-gold"
                >
                  {language === 'ur'
                    ? `مزید آیات لوڈ کریں (${ayahs.length - visibleVerseCount})`
                    : `Load More Verses (${ayahs.length - visibleVerseCount} remaining)`}
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
      <header>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Go back"
              className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-sans text-accent-gold font-bold tracking-tight uppercase">Holy Quran</h2>
          </div>
          <button
            onClick={onOpenTools}
            aria-label="Open menu"
            className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary/40 group-focus-within:text-accent-gold transition-colors" />
          <input
            type="text"
            placeholder="Search Surah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-card border border-border-main rounded-2xl py-4 pl-12 pr-4 text-sm text-text-primary outline-none focus:border-accent-gold/40 transition-colors placeholder:text-text-primary/20"
          />
        </div>
      </header>

      {isSurahsLoading && surahs.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-primary/50">
            {language === 'ur' ? 'سورتیں لوڈ ہو رہی ہیں...' : 'Loading Surahs...'}
          </p>
        </div>
      ) : surahsError && surahs.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 px-6">
          <WifiOff className="w-10 h-10 text-accent-gold/60" />
          <p className="text-sm text-text-primary/70">
            {language === 'ur'
              ? 'قرآن کی فہرست لوڈ نہیں ہو سکی۔ براہ کرم انٹرنیٹ کنکشن چیک کریں۔'
              : 'Unable to load Surahs. Please check your internet connection and try again.'}
          </p>
          {onRetrySurahs && (
            <button
              onClick={onRetrySurahs}
              className="px-5 py-2.5 rounded-xl bg-accent-gold text-bg-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'دوبارہ کوشش کریں' : 'Retry'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          {visibleSurahs.map((surah) => (
            <button
              key={surah.number}
              onClick={() => setSelectedSurah(surah)}
              className="w-full glass-card p-4 rounded-2xl flex items-center justify-between group transition-transform active:scale-[0.99] hover:bg-bg-secondary"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold font-mono text-xs font-bold group-hover:bg-accent-gold group-hover:text-bg-primary transition-colors border border-accent-gold/20">
                  {surah.number}
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-text-primary group-hover:text-accent-gold transition-colors">{surah.englishName}</h4>
                  <p className="text-[10px] text-text-primary/40 uppercase tracking-tighter font-bold">
                    {surah.revelationType} • {surah.numberOfAyahs} Verses
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="arabic-text text-lg text-accent-gold">{surah.name}</p>
              </div>
            </button>
          ))}

          {visibleSurahCount < filteredSurahs.length && (
            <div ref={surahSentinelRef} className="py-4 text-center">
              <button
                onClick={() => setVisibleSurahCount(prev => Math.min(filteredSurahs.length, prev + SURAH_PAGE_SIZE))}
                className="px-5 py-2.5 glass-card rounded-xl text-xs font-bold uppercase tracking-wider text-accent-gold"
              >
                {language === 'ur'
                  ? `مزید سورتیں دکھائیں (${filteredSurahs.length - visibleSurahCount})`
                  : `Show More Surahs (${filteredSurahs.length - visibleSurahCount} remaining)`}
              </button>
            </div>
          )}

          {filteredSurahs.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-text-primary/40 italic font-sans">No surah found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
