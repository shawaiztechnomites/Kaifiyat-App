import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ChevronLeft, Volume2, Pause, Search } from 'lucide-react';
import { Ayah } from '../types';
import { getJuzDetail } from '../services/api';
import { cn } from '../lib/utils';

interface Props {
  language: 'en' | 'ur';
}

export default function QuranReading({ language }: Props) {
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = {
    en: {
      title: 'Complete Quran',
      sub: 'Read by Para / Juz',
      loading: 'Loading Para...',
      back: 'Back to List',
      para: 'Para',
      tapToRead: 'Tap to start reading with Urdu translation'
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

  useEffect(() => {
    if (selectedJuz) {
      setIsLoading(true);
      getJuzDetail(selectedJuz, language).then(data => {
        setAyahs(data);
        setIsLoading(false);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedJuz]);

  const handlePlayAudio = (ayah: Ayah) => {
    if (!ayah.audio) {
      console.warn("Audio not available for this Ayah");
      return;
    }
    
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
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setPlayingAyah(null);
        });
      }
      
      audio.onended = () => setPlayingAyah(null);
      audio.onerror = () => {
        console.error("Audio error");
        setPlayingAyah(null);
      };
    } catch (err) {
      console.error("Error creating audio object:", err);
      setPlayingAyah(null);
    }
  };

  if (selectedJuz) {
    return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-300">
        <header className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedJuz(null)}
            className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className={cn("text-xl font-bold text-accent-gold", language === 'ur' && "urdu-text")}>
              {t.para} {selectedJuz}
            </h2>
            <p className="text-[10px] text-text-primary/40 uppercase tracking-widest font-bold">Urdu Translation</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
            <p className={cn("text-accent-gold/60 text-sm italic", language === 'ur' && "urdu-text")}>{t.loading}</p>
          </div>
        ) : ayahs.length > 0 ? (
          <div className="space-y-8 pb-10 overflow-y-auto">
            {ayahs.map((ayah) => (
              <motion.div 
                key={ayah.number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold text-[10px] font-mono font-bold border border-accent-gold/20">
                    {ayah.numberInSurah}
                  </span>
                  <button 
                    onClick={() => handlePlayAudio(ayah)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      playingAyah === ayah.number ? "bg-accent-gold text-bg-primary" : "text-accent-gold hover:bg-accent-gold/10"
                    )}
                  >
                    {playingAyah === ayah.number ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <p className="arabic-text text-2xl text-white mb-6 leading-[2.5] text-right">
                  {ayah.text}
                </p>
                
                <div className="h-px w-1/4 bg-accent-gold/10 mx-auto mb-6" />
                
                <p className={cn(
                  "text-lg text-text-primary/80 leading-[2]",
                  language === 'ur' ? "urdu-text text-right" : "font-sans text-left"
                )}>
                  {ayah.translation}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
             <Book className="w-12 h-12 text-accent-gold opacity-20" />
             <p className={cn("text-text-primary/40 italic", language !== 'ur' && "font-sans")}>
               {language === 'ur' ? 'مواد لوڈ کرنے میں مسئلہ ہوا، براہ کرم دوبارہ کوشش کریں' : 'Failed to load content. Please try again.'}
             </p>
             <button 
               onClick={() => setSelectedJuz(selectedJuz)}
               className="text-accent-gold text-xs font-bold uppercase tracking-widest underline"
             >
               {language === 'ur' ? 'دوبارہ کوشش کریں' : 'Retry'}
             </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className={cn("text-2xl font-bold mb-1 tracking-tight uppercase", language === 'ur' ? "urdu-text" : "font-sans text-accent-gold")}>
          {t.title}
        </h2>
        <p className="text-text-primary/40 text-[10px] uppercase tracking-widest font-bold">{t.sub}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 pb-10">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((para) => (
          <motion.button
            key={para}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedJuz(para)}
            className="glass-card p-5 rounded-3xl text-left space-y-3 group hover:border-accent-gold/30 transition-all border-accent-gold/5"
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
          </motion.button>
        ))}
      </div>
    </div>
  );
}

