import { motion } from 'motion/react';
import { Clock, MapPin, Sun, Moon, Cloud, ChevronRight, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { PrayerTimes, HijriDate } from '../types';
import { formatTime, getRemainingTime, cn } from '../lib/utils';

interface Props {
  prayerData: { timings: PrayerTimes; date: HijriDate } | null;
  onOpenTools: () => void;
  language: 'en' | 'ur';
}

export default function Dashboard({ prayerData, onOpenTools, language }: Props) {
  if (!prayerData) return null;

  const t = {
    en: {
      assalamu: 'Assalamu',
      alaikum: 'Alaikum',
      upcoming: 'Upcoming Prayer',
      schedule: "Today's Schedule",
      verse: 'Verse of the Day',
      readFull: 'Read Full Surah',
      sunnah: 'Sunnah',
      in: 'In',
      updated: 'Updated'
    },
    ur: {
      assalamu: 'السلام',
      alaikum: 'علیکم',
      upcoming: 'اگلی نماز',
      schedule: 'آج کا شیڈول',
      verse: 'آج کی آیت',
      readFull: 'مکمل سورہ پڑھیں',
      sunnah: 'سنت',
      in: 'میں',
      updated: 'اپ ڈیٹ'
    }
  }[language];

  const { timings, date } = prayerData;
  const prayers = language === 'ur' ? [
    { name: 'فجر', original: 'Fajr', time: timings.Fajr, icon: Sun },
    { name: 'سورج نکلنا', original: 'Sunrise', time: timings.Sunrise, icon: Sun },
    { name: 'ظہر', original: 'Dhuhr', time: timings.Dhuhr, icon: Cloud },
    { name: 'عصر', original: 'Asr', time: timings.Asr, icon: Cloud },
    { name: 'مغرب', original: 'Maghrib', time: timings.Maghrib, icon: Moon },
    { name: 'عشاء', original: 'Isha', time: timings.Isha, icon: Moon },
  ] : [
    { name: 'Fajr', original: 'Fajr', time: timings.Fajr, icon: Sun },
    { name: 'Sunrise', original: 'Sunrise', time: timings.Sunrise, icon: Sun },
    { name: 'Dhuhr', original: 'Dhuhr', time: timings.Dhuhr, icon: Cloud },
    { name: 'Asr', original: 'Asr', time: timings.Asr, icon: Cloud },
    { name: 'Maghrib', original: 'Maghrib', time: timings.Maghrib, icon: Moon },
    { name: 'Isha', original: 'Isha', time: timings.Isha, icon: Moon },
  ];

  // Helper to find next prayer
  const now = new Date();
  const getNextPrayer = () => {
    for (const p of prayers) {
      const [h, m] = p.time.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(h, m, 0, 0);
      if (prayerTime > now) return p;
    }
    return prayers[0]; // Next day's Fajr
  };

  const nextPrayer = getNextPrayer();
  const remaining = getRemainingTime(nextPrayer.time);

  return (
    <div className="space-y-6">
      {/* Header / Hijri Date */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className={cn(
            "text-3xl font-bold leading-tight uppercase tracking-tight",
            language === 'ur' ? "urdu-text text-4xl" : "font-sans text-accent-gold"
          )}>
            {t.assalamu}<br />{t.alaikum}
          </h1>
          <p className="text-text-primary/60 text-sm mt-1 flex items-center gap-1.5 uppercase tracking-widest font-medium">
            <Clock className="w-3 h-3" />
            {format(new Date(), 'dd MMMM yyyy')}
          </p>
        </div>
        <button 
          onClick={onOpenTools}
          className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Hero: Next Prayer */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border-accent-gold/20"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <nextPrayer.icon className="w-32 h-32 text-accent-gold" />
        </div>
        
        <p className="text-accent-gold/70 text-xs font-semibold uppercase tracking-[0.25em] mb-2 px-1">
          {t.upcoming}
        </p>
        <h2 className={cn(
          "text-4xl font-bold text-text-primary mb-1 tracking-tight",
          language === 'ur' ? "urdu-text" : "font-sans"
        )}>{nextPrayer.name}</h2>
        <p className="text-accent-gold text-lg font-medium tracking-tight">{formatTime(nextPrayer.time)}</p>
        
        <div className="mt-8 flex items-center justify-between">
          <div className="w-48 h-1 bg-border-main rounded-full">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, 100 - (remaining.hours * 60 + remaining.minutes) / 2)}%` }}
              className="h-full bg-accent-gold rounded-full shadow-[0_0_8px_rgba(197,160,89,0.5)]" 
            />
          </div>
          <p className="text-text-primary/60 text-[10px] uppercase font-bold tracking-widest italic">
            {t.in} {remaining.hours > 0 && `${remaining.hours}h `}{remaining.minutes}m
          </p>
        </div>
      </motion.div>

      {/* Prayer Times Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-accent-gold">{t.schedule}</h3>
          <p className="text-text-primary/40 text-[9px] uppercase tracking-widest font-bold">{t.updated}: {formatTime(timings.Fajr)}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {prayers.map((prayer) => (
            <motion.div
              key={prayer.original}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "glass-card p-4 rounded-2xl flex items-center justify-between transition-all",
                nextPrayer.original === prayer.original ? "bg-bg-card border-accent-gold/40 shadow-lg shadow-accent-gold/5" : "bg-bg-secondary/40"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  nextPrayer.original === prayer.original ? "bg-accent-gold text-bg-primary border-accent-gold" : "bg-bg-card text-accent-gold/60 border-border-main"
                )}>
                  <prayer.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={cn(
                    "text-sm font-medium", 
                    prayer.original === 'Zohar' ? "text-accent-gold" : "text-text-primary/90",
                    language === 'ur' && "urdu-text text-base"
                  )}>
                    {prayer.name}
                  </h4>
                  <p className="text-[9px] text-text-primary/30 uppercase tracking-widest font-bold">{t.sunnah}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-accent-gold text-sm font-bold tracking-tighter">
                  {formatTime(prayer.time)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Verse of the Day */}
      <section className="pt-4">
        <div className="glass-card rounded-[2rem] p-6 border-accent-gold/10 bg-bg-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent-gold">{t.verse}</h3>
            <span className="text-[9px] text-text-primary/40 font-sans italic">Surah Al-Baqarah 2:152</span>
          </div>
          <p className="arabic-text text-xl text-white mb-4 leading-loose text-right">
            فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ
          </p>
          <p className={cn(
            "text-text-primary/80 text-sm leading-relaxed italic mb-4",
            language === 'ur' ? "urdu-text text-base" : "font-sans"
          )}>
            {language === 'ur' ? '"پس تم میرا ذکر کرو، میں تمہارا ذکر کروں گا، اور میرا شکر ادا کرو اور میری ناشکری نہ کرو۔"' : '"So remember Me; I will remember you. And be grateful to Me and do not deny Me."'}
          </p>
          <button className="w-full py-3 rounded-xl border border-accent-gold/20 text-accent-gold text-[10px] uppercase font-bold tracking-widest hover:bg-accent-gold/5 transition-colors">
            {t.readFull}
          </button>
        </div>
      </section>
    </div>
  );
}
