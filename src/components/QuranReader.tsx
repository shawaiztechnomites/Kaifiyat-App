import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, BookOpen, Volume2, Bookmark, Share2, Pause } from 'lucide-react';
import { Surah, Ayah } from '../types';
import { getSurahDetail } from '../services/api';
import { cn } from '../lib/utils';

interface Props {
  surahs: Surah[];
  language: 'en' | 'ur';
}

export default function QuranReader({ surahs, language }: Props) {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (selectedSurah) {
      setIsLoadingDetail(true);
      getSurahDetail(selectedSurah.number, language).then((data) => {
        setAyahs(data);
        setIsLoadingDetail(false);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedSurah, language]);

  const handlePlayAudio = (ayah: Ayah) => {
    if (!ayah.audio) {
      console.warn("Audio not available for this verse");
      return;
    }

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
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setPlayingAyah(null);
        });
      }

      audio.onended = () => {
        setPlayingAyah(null);
      };
      
      audio.onerror = () => {
        console.error("Audio error");
        setPlayingAyah(null);
      };
    } catch (err) {
      console.error("Error creating audio:", err);
      setPlayingAyah(null);
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.includes(searchQuery)
  );

  if (selectedSurah) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
        <header className="flex items-center justify-between sticky top-0 bg-bg-primary/80 backdrop-blur-xl py-2 z-20">
          <button 
            onClick={() => setSelectedSurah(null)}
            className="p-2 glass-card rounded-xl text-accent-gold hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-sans font-bold text-accent-gold tracking-tight">{selectedSurah.englishName}</h2>
          </div>
          <div className="w-10" />
        </header>

        {isLoadingDetail ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8 pb-10">
             {selectedSurah.number !== 1 && (
               <div className="text-center py-8">
                 <p className="arabic-text text-3xl text-text-primary">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
               </div>
             )}
             
             {ayahs.map((ayah) => (
               <motion.div 
                 key={ayah.number}
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="p-6 glass-card rounded-3xl border-accent-gold/5 relative group bg-bg-secondary/20"
               >
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-3">
                     <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-gold/10 text-accent-gold text-xs font-bold font-mono border border-accent-gold/20">
                       {ayah.numberInSurah}
                     </span>
                     <div className="flex gap-2">
                       <button 
                        onClick={() => handlePlayAudio(ayah)}
                        className={cn(
                          "p-1.5 transition-colors",
                          playingAyah === ayah.number ? "text-accent-gold" : "text-text-primary/20 hover:text-accent-gold"
                        )}
                       >
                         {playingAyah === ayah.number ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                       </button>
                       <button className="p-1.5 text-text-primary/20 hover:text-accent-gold transition-colors"><Bookmark className="w-4 h-4" /></button>
                     </div>
                   </div>
                   <button className="p-1.5 text-text-primary/20 hover:text-accent-gold transition-colors opacity-0 group-hover:opacity-100"><Share2 className="w-4 h-4" /></button>
                 </div>
                 
                 <p className="arabic-text text-2xl lg:text-3xl text-white leading-[2.5] text-right mb-6" dir="rtl">
                   {ayah.text}
                 </p>
                 
                 <div className="h-px w-1/4 bg-accent-gold/10 mx-auto mb-6" />
                 
                 <p className={cn(
                   "text-text-primary/80 text-sm leading-relaxed",
                   language === 'ur' ? "urdu-text text-xl text-right leading-[2]" : "font-sans italic text-left"
                 )}>
                   {ayah.translation}
                 </p>
               </motion.div>
             ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-sans text-accent-gold font-bold mb-4 tracking-tight uppercase">Holy Quran</h2>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary/40 group-focus-within:text-accent-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search Surah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-card border border-border-main rounded-2xl py-4 pl-12 pr-4 text-sm text-text-primary outline-none focus:border-accent-gold/40 transition-all placeholder:text-text-primary/20"
          />
        </div>
      </header>

      <div className="space-y-3">
        {filteredSurahs.map((surah) => (
          <motion.button
            key={surah.number}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSurah(surah)}
            className="w-full glass-card p-4 rounded-2xl flex items-center justify-between group transition-all hover:bg-bg-secondary"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold font-mono text-xs font-bold group-hover:bg-accent-gold group-hover:text-bg-primary transition-all border border-accent-gold/20">
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
          </motion.button>
        ))}
        {filteredSurahs.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-text-primary/40 italic font-sans">No surah found</p>
          </div>
        )}
      </div>
    </div>
  );
}
