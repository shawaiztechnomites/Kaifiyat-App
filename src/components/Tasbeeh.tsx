import { useState, useCallback } from 'react';
import { motion, useAnimation } from 'motion/react';
import { RefreshCcw, Trophy, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

interface Props {
  language: 'en' | 'ur';
}

export default function Tasbeeh({ language }: Props) {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [target, setTarget] = useState(33);
  const controls = useAnimation();

  const t = {
    en: {
      title: 'Tasbeeh',
      sub: 'Digital Counter',
      tap: 'Tap to Count',
      target: 'Target',
      lifetime: 'Lifetime',
      phrases: 'Common Phrases',
      resetPrompt: 'Reset current counter?',
      items: ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar', 'Astaghfirullah']
    },
    ur: {
      title: 'تسبیح',
      sub: 'ڈیجیٹل کاؤنٹر',
      tap: 'گننے کے لیے دبائیں',
      target: 'ہدف',
      lifetime: 'کل تعداد',
      phrases: 'عام تسبیحات',
      resetPrompt: 'کیا آپ کاؤنٹر کو صفر کرنا چاہتے ہیں؟',
      items: ['سبحان اللہ', 'الحمد للہ', 'اللہ اکبر', 'استغفر اللہ']
    }
  }[language];

  const handleIncrement = useCallback(async () => {
    setCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);
    
    // Animate scale
    await controls.start({
      scale: 0.95,
      transition: { duration: 0.05 }
    });
    controls.start({
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 10 }
    });

    if ((count + 1) % target === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#D4AF37', '#15803D', '#FFFFFF']
      });
      setCount(0);
    }
  }, [count, target, controls]);

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    if (resetConfirm) {
      setCount(0);
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000); // Auto-cancel after 3s
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className={cn("text-2xl font-bold", language === 'ur' ? "urdu-text" : "font-sans text-accent-gold")}>
            {t.title}
          </h2>
          <p className="text-text-primary/40 text-[10px] uppercase tracking-widest font-bold">{t.sub}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setTarget(target === 33 ? 100 : 33)}
            className="p-3 glass-card rounded-2xl text-gold-100/60 hover:text-gold-500 transition-colors flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            <span className="text-xs font-mono font-bold">{target}</span>
          </button>
          <button 
            onClick={handleReset}
            className={cn(
              "p-3 glass-card rounded-2xl transition-all duration-300 flex items-center gap-2",
              resetConfirm ? "text-red-500 border-red-500/50 bg-red-500/10" : "text-gold-100/60 hover:text-gold-500 transition-colors"
            )}
          >
            <RefreshCcw className={cn("w-5 h-5", resetConfirm && "animate-spin-slow")} />
            {resetConfirm && <span className="text-[10px] font-bold uppercase tracking-widest">{language === 'ur' ? 'صفر کریں؟' : 'Reset?'}</span>}
          </button>
        </div>
      </header>

      {/* Main Counter Display */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 pb-12">
        <div className="relative">
          {/* Circular Progress (Visual only) */}
          <div className="absolute inset-[-40px] rounded-full border-2 border-accent-gold/5" />
          <div className="absolute inset-[-20px] rounded-full border-2 border-accent-gold/20 border-t-accent-gold rotate-[-90deg]" style={{ clipPath: `conic-gradient(from 0deg, white ${ (count / target) * 360 }deg, transparent 0deg)` }} />
          
          <motion.button
            animate={controls}
            onClick={handleIncrement}
            className="w-64 h-64 rounded-full glass-card border-accent-gold/20 shadow-[0_0_50px_rgba(197,160,89,0.1)] flex flex-col items-center justify-center relative z-10 hover:border-accent-gold/40 transition-colors active:shadow-inner"
          >
            <span className="text-[120px] font-mono font-bold text-accent-gold leading-none">
              {count}
            </span>
            <span className={cn(
              "text-text-primary/40 text-xs font-bold uppercase tracking-[0.3em] italic",
              language === 'ur' ? "urdu-text" : "font-sans"
            )}>
              {t.tap}
            </span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full px-4">
          <div className="glass-card p-6 rounded-3xl text-center">
            <p className="text-text-primary/40 text-[10px] uppercase font-bold tracking-widest mb-1">{t.target}</p>
            <p className="text-2xl font-mono font-bold text-white">{target}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl text-center border-accent-gold/10">
            <p className="text-text-primary/40 text-[10px] uppercase font-bold tracking-widest mb-1">{t.lifetime}</p>
            <p className="text-2xl font-mono font-bold text-accent-gold">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* Preset Phrases */}
      <section className="space-y-3">
        <p className="text-text-primary/40 text-[10px] uppercase font-bold tracking-widest px-2">{t.phrases}</p>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {t.items.map((phrase) => (
            <button 
              key={phrase}
              onClick={() => { setCount(0); }}
              className={cn(
                "whitespace-nowrap px-6 py-3 glass-card rounded-2xl text-xs font-medium transition-all group",
                language === 'ur' ? "urdu-text text-sm" : "font-sans"
              )}
            >
              <span className="text-text-primary/80 group-hover:text-accent-gold">{phrase}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
