import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { RefreshCcw, Target, Volume2, VolumeX, Check, X, Menu, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

interface Props {
  language: 'en' | 'ur';
  onOpenTools: () => void;
  onBack: () => void;
}

const MAX_TARGET = 1000;
const PRESET_TARGETS = [33, 99, 100, 500, 1000];

export default function Tasbeeh({ language, onOpenTools, onBack }: Props) {
  const [count, setCount] = useState<number>(() => {
    const saved = localStorage.getItem('tasbeeh_count');
    return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
  });
  const [totalCount, setTotalCount] = useState<number>(() => {
    const saved = localStorage.getItem('tasbeeh_total');
    return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
  });
  const [target, setTarget] = useState<number>(() => {
    const saved = localStorage.getItem('tasbeeh_target');
    const parsed = saved ? parseInt(saved, 10) : 33;
    return parsed >= 1 && parsed <= MAX_TARGET ? parsed : 33;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('tasbeeh_sound');
    return saved !== 'false';
  });
  const [activePhraseIdx, setActivePhraseIdx] = useState<number>(0);

  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState(String(target));
  const [targetError, setTargetError] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  const controls = useAnimation();
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('tasbeeh_count', String(count));
  }, [count]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_total', String(totalCount));
  }, [totalCount]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_target', String(target));
  }, [target]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_sound', String(soundEnabled));
  }, [soundEnabled]);

  const t = {
    en: {
      title: 'Tasbeeh',
      sub: 'Digital Counter',
      tap: 'Tap to Count',
      target: 'Target',
      lifetime: 'Lifetime',
      phrases: 'Common Phrases',
      setTargetTitle: 'Set Tasbeeh Target',
      setTargetDesc: 'Choose a preset or enter your own target (1 - 1000)',
      customPlaceholder: 'Enter target (max 1000)',
      maxNote: 'Maximum allowed target is 1000 counts',
      invalidTarget: 'Please enter a number between 1 and 1000',
      apply: 'Set Target',
      cancel: 'Cancel',
      soundOn: 'Sound On',
      soundOff: 'Muted',
      items: ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar', 'Astaghfirullah']
    },
    ur: {
      title: 'تسبیح',
      sub: 'ڈیجیٹل کاؤنٹر',
      tap: 'گننے کے لیے دبائیں',
      target: 'ہدف',
      lifetime: 'کل تعداد',
      phrases: 'عام تسبیحات',
      setTargetTitle: 'تسبیح کا ہدف مقرر کریں',
      setTargetDesc: 'مقررہ ہدف چنیں یا اپنی مرضی کا نمبر درج کریں (1 تا 1000)',
      customPlaceholder: 'ہدف درج کریں (زیادہ سے زیادہ 1000)',
      maxNote: 'زیادہ سے زیادہ ہدف 1000 مقرر کیا جا سکتا ہے',
      invalidTarget: 'براہ کرم 1 سے 1000 کے درمیان نمبر درج کریں',
      apply: 'محفوظ کریں',
      cancel: 'منسوخ',
      soundOn: 'آواز آن',
      soundOff: 'بند',
      items: ['سبحان اللہ', 'الحمد للہ', 'اللہ اکبر', 'استغفر اللہ']
    }
  }[language];

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playTapSound = useCallback((isTargetComplete: boolean) => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (isTargetComplete) {
      // Pleasant celebratory chime chord when target is reached
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.48);
      });
    } else {
      // Crisp wooden/bead tactile click on every tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.045);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  }, [soundEnabled, getAudioContext]);

  const handleIncrement = useCallback(async () => {
    const nextCount = count + 1;
    const completed = nextCount >= target;

    playTapSound(completed);

    setTotalCount(prev => prev + 1);
    if (completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#D4AF37', '#15803D', '#FFFFFF']
      });
      setCount(0);
    } else {
      setCount(nextCount);
    }

    // Animate scale
    await controls.start({
      scale: 0.95,
      transition: { duration: 0.05 }
    });
    controls.start({
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 12 }
    });
  }, [count, target, controls, playTapSound]);

  const handleReset = () => {
    if (resetConfirm) {
      setCount(0);
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  const openTargetModal = () => {
    setCustomTargetInput(String(target));
    setTargetError('');
    setIsTargetModalOpen(true);
  };

  const applyTargetValue = (val: number) => {
    if (!Number.isFinite(val) || val < 1 || val > MAX_TARGET) {
      setTargetError(t.invalidTarget);
      return;
    }
    const cleanVal = Math.floor(val);
    setTarget(cleanVal);
    if (count >= cleanVal) {
      setCount(0);
    }
    setTargetError('');
    setIsTargetModalOpen(false);
  };

  const handleTargetInputChange = (raw: string) => {
    const digitsOnly = raw.replace(/[^0-9]/g, '');
    if (!digitsOnly) {
      setCustomTargetInput('');
      setTargetError('');
      return;
    }
    const num = parseInt(digitsOnly, 10);
    if (num > MAX_TARGET) {
      setCustomTargetInput(String(MAX_TARGET));
      setTargetError(t.maxNote);
    } else {
      setCustomTargetInput(digitsOnly);
      setTargetError('');
    }
  };

  const progress = Math.min(1, count / target);
  const circleRadius = 136;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progress);

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <header className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2.5 sm:p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className={cn("text-xl sm:text-2xl font-bold truncate", language === 'ur' ? "urdu-text" : "font-sans text-accent-gold")}>
              {t.title}
            </h2>
            <p className="text-text-primary/40 text-[10px] uppercase tracking-widest font-bold truncate">{t.sub}</p>
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            title={soundEnabled ? t.soundOn : t.soundOff}
            aria-label={soundEnabled ? t.soundOn : t.soundOff}
            className={cn(
              "p-2.5 sm:p-3 glass-card rounded-2xl transition-colors flex items-center justify-center",
              soundEnabled
                ? "text-accent-gold border-accent-gold/30"
                : "text-text-primary/40 hover:text-text-primary/70"
            )}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={openTargetModal}
            className="p-2.5 sm:p-3 glass-card rounded-2xl text-text-primary/70 hover:text-accent-gold transition-colors flex items-center gap-1.5"
          >
            <Target className="w-4 h-4 text-accent-gold" />
            <span className="text-xs font-mono font-bold">{target}</span>
          </button>

          <button
            onClick={handleReset}
            className={cn(
              "p-2.5 sm:p-3 glass-card rounded-2xl transition-all duration-300 flex items-center gap-1.5",
              resetConfirm ? "text-red-500 border-red-500/50 bg-red-500/10" : "text-text-primary/60 hover:text-accent-gold"
            )}
          >
            <RefreshCcw className={cn("w-4 h-4 sm:w-5 sm:h-5", resetConfirm && "animate-spin-slow")} />
            {resetConfirm && <span className="text-[10px] font-bold uppercase tracking-widest">{language === 'ur' ? 'صفر کریں؟' : 'Reset?'}</span>}
          </button>

          <button
            onClick={onOpenTools}
            aria-label="Open menu"
            className="p-2.5 sm:p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Counter Display */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 pb-6">
        <div className="relative flex items-center justify-center">
          {/* Outer subtle halo */}
          <div className="absolute w-[310px] h-[310px] rounded-full border border-accent-gold/10 pointer-events-none" />

          {/* SVG Circular Progress Ring */}
          <svg
            width="292"
            height="292"
            viewBox="0 0 292 292"
            className="absolute -rotate-90 pointer-events-none"
          >
            <circle
              cx="146"
              cy="146"
              r={circleRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-accent-gold/15"
            />
            <circle
              cx="146"
              cy="146"
              r={circleRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              className="text-accent-gold transition-all duration-150 ease-out"
            />
          </svg>

          <motion.button
            animate={controls}
            onClick={handleIncrement}
            className="w-64 h-64 rounded-full glass-card border-accent-gold/20 shadow-[0_0_50px_rgba(197,160,89,0.1)] flex flex-col items-center justify-center relative z-10 hover:border-accent-gold/40 transition-colors active:shadow-inner select-none"
          >
            <span className={cn(
              "font-mono font-bold text-accent-gold leading-none tabular-nums",
              count >= 100 ? "text-7xl" : count >= 10 ? "text-8xl" : "text-[110px]"
            )}>
              {count}
            </span>
            <span className={cn(
              "text-text-primary/40 text-xs font-bold uppercase tracking-[0.25em] mt-2",
              language === 'ur' ? "urdu-text tracking-normal" : "font-sans"
            )}>
              {t.tap}
            </span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full px-2">
          <button
            onClick={openTargetModal}
            className="glass-card p-5 rounded-3xl text-center hover:border-accent-gold/40 transition-colors group"
          >
            <p className="text-text-primary/40 text-[10px] uppercase font-bold tracking-widest mb-1 group-hover:text-accent-gold transition-colors">
              {t.target}
            </p>
            <p className="text-2xl font-mono font-bold text-text-primary">{target}</p>
          </button>
          <div className="glass-card p-5 rounded-3xl text-center border-accent-gold/10">
            <p className="text-text-primary/40 text-[10px] uppercase font-bold tracking-widest mb-1">{t.lifetime}</p>
            <p className="text-2xl font-mono font-bold text-accent-gold">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* Preset Phrases */}
      <section className="space-y-3">
        <p className="text-text-primary/40 text-[10px] uppercase font-bold tracking-widest px-2">{t.phrases}</p>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {t.items.map((phrase, idx) => (
            <button
              key={phrase}
              onClick={() => {
                setActivePhraseIdx(idx);
                setCount(0);
              }}
              className={cn(
                "whitespace-nowrap px-6 py-3 glass-card rounded-2xl text-xs font-medium transition-all group",
                activePhraseIdx === idx ? "border-accent-gold/60 bg-accent-gold/10" : "",
                language === 'ur' ? "urdu-text text-sm" : "font-sans"
              )}
            >
              <span className={cn(
                "group-hover:text-accent-gold transition-colors",
                activePhraseIdx === idx ? "text-accent-gold font-semibold" : "text-text-primary/80"
              )}>
                {phrase}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Custom Target Modal */}
      <AnimatePresence>
        {isTargetModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsTargetModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass-card rounded-3xl p-6 space-y-5 border-accent-gold/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className={cn(
                    "text-lg font-bold text-accent-gold",
                    language === 'ur' && "urdu-text"
                  )}>
                    {t.setTargetTitle}
                  </h3>
                  <p className={cn(
                    "text-xs text-text-primary/60 mt-1",
                    language === 'ur' && "urdu-text"
                  )}>
                    {t.setTargetDesc}
                  </p>
                </div>
                <button
                  onClick={() => setIsTargetModalOpen(false)}
                  className="p-1.5 rounded-xl text-text-primary/50 hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-5 gap-2">
                {PRESET_TARGETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCustomTargetInput(String(preset));
                      setTargetError('');
                    }}
                    className={cn(
                      "py-2.5 rounded-xl font-mono text-xs font-bold border transition-all",
                      Number(customTargetInput) === preset
                        ? "bg-accent-gold text-bg-primary border-accent-gold"
                        : "bg-bg-secondary/60 text-text-primary/80 border-border-main hover:border-accent-gold/50"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyTargetValue(parseInt(customTargetInput, 10));
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={MAX_TARGET}
                    inputMode="numeric"
                    value={customTargetInput}
                    onChange={(e) => handleTargetInputChange(e.target.value)}
                    placeholder={t.customPlaceholder}
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl bg-bg-secondary border border-border-main focus:border-accent-gold focus:outline-none text-text-primary font-mono text-lg font-bold text-center"
                  />
                </div>

                {targetError ? (
                  <p className={cn("text-xs text-red-400 text-center", language === 'ur' && "urdu-text")}>
                    {targetError}
                  </p>
                ) : (
                  <p className={cn("text-[11px] text-text-primary/40 text-center", language === 'ur' && "urdu-text")}>
                    {t.maxNote}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsTargetModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl bg-bg-secondary border border-border-main text-text-primary/70 text-xs font-bold uppercase tracking-wider hover:text-text-primary transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-accent-gold text-bg-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.apply}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
