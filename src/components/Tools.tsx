import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  Moon,
  Sun,
  Star,
  Share2,
  Heart,
  Globe,
  HelpCircle,
  ShieldCheck,
  Languages
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NAMES_OF_MUHAMMAD } from '../constants/names';
import { getAsmaAlHusna } from '../services/api';

interface Props {
  onBack: () => void;
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

type ToolView = 'list' | 'zakat' | 'names' | 'muhammad_names' | 'language' | 'theme';

export default function Tools({ onBack, language, setLanguage, theme, setTheme }: Props) {
  const [currentView, setCurrentView] = useState<ToolView>('list');
  const [asmaAlHusna, setAsmaAlHusna] = useState<any[]>([]);
  const [isLoadingNames, setIsLoadingNames] = useState(false);

  // Translations
  const t = {
    en: {
      moreTools: 'More Tools',
      manage: 'Manage & Explore',
      zakat: 'Zakat Calculator',
      names: 'Asma-ul-Husna (Allah)',
      muhammadNames: '99 Names of Muhammad (PBUH)',
      language: 'Language',
      theme: 'Appearance',
      share: 'Share App',
      contact: 'Contact Us',
      cash: 'Total Cash/Bank Balance',
      gold: 'Value of Gold/Silver',
      calculated: 'Calculated Zakat (2.5%)',
      zakatNote: 'Nisab threshold varies. Please consult a scholar.',
      asmaMeaning: 'Learn and memorize the 99 names of Allah',
      muhammadMeaning: 'Learn the beautiful names of Prophet Muhammad (PBUH)',
      settings: 'Settings',
      globalLang: 'Global Language Setting',
      langNote: 'This changes the translation language in Quran tab.',
      themeTitle: 'Theme Settings',
      themeNote: 'Choose between light and dark mode.',
      dark: 'Dark Mode',
      light: 'Light Mode',
      back: 'Go Back',
      premium: 'Premium Member'
    },
    ur: {
      moreTools: 'مزید ٹولز',
      manage: 'انتظام اور دریافت',
      zakat: 'زکوٰۃ کیلکولیٹر',
      names: 'اللہ کے نام (اسماء الحسنٰی)',
      muhammadNames: 'محمد ﷺ کے 99 نام',
      language: 'زبان',
      theme: 'ظاہری شکل',
      share: 'ایپ شیئر کریں',
      contact: 'ہم سے رابطہ کریں',
      cash: 'کل نقد رقم/بینک بیلنس',
      gold: 'سونے/چاندی کی قیمت',
      calculated: 'حساب شدہ زکوٰۃ (2.5%)',
      zakatNote: 'نصاب کی حد مختلف ہوتی ہے۔ براہ کرم کسی عالم سے مشورہ کریں۔',
      asmaMeaning: 'اللہ کے 99 نام سیکھیں اور یاد کریں',
      muhammadMeaning: 'نبی کریم ﷺ کے مبارک نام سیکھیں',
      settings: 'ترتیبات',
      globalLang: 'عالمی زبان کی ترتیب',
      langNote: 'یہ قرآن ٹیب میں ترجمہ کی زبان بدل دے گا۔',
      themeTitle: 'تھیم کی ترتیبات',
      themeNote: 'ڈارک اور لائٹ موڈ کے درمیان انتخاب کریں۔',
      dark: 'ڈارک موڈ',
      light: 'لائٹ موڈ',
      back: 'واپس جائیں',
      premium: 'پریمیم ممبر'
    }
  }[language];

  useEffect(() => {
    if (currentView === 'names' && asmaAlHusna.length === 0) {
      setIsLoadingNames(true);
      getAsmaAlHusna().then(data => {
        setAsmaAlHusna(data);
        setIsLoadingNames(false);
      });
    }
  }, [currentView]);

  // Sub-components
  const ZakatCalculator = () => {
    const [cash, setCash] = useState('');
    const [gold, setGold] = useState('');
    const result = (Number(cash || 0) + Number(gold || 0)) * 0.025;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">{t.cash}</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="w-full bg-bg-primary border border-border-main rounded-2xl p-4 text-text-primary outline-none focus:border-accent-gold/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">{t.gold}</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={gold}
              onChange={(e) => setGold(e.target.value)}
              className="w-full bg-bg-primary border border-border-main rounded-2xl p-4 text-text-primary outline-none focus:border-accent-gold/40"
            />
          </div>
          <div className="pt-4 border-t border-border-main">
            <p className="text-[10px] uppercase font-bold tracking-widest text-text-primary/40 mb-1">{t.calculated}</p>
            <p className="text-4xl font-mono font-bold text-accent-gold">{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        <p className="text-[10px] text-text-primary/40 font-sans italic text-center px-4">
          {t.zakatNote}
        </p>
      </div>
    );
  };

  const NamesOfAllah = () => {
    if (isLoadingNames) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent-gold animate-spin" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right duration-300 pb-10">
        {asmaAlHusna.map((name, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl text-center space-y-2 group hover:border-accent-gold/30 transition-colors">
            <p className="arabic-text text-2xl text-white group-hover:text-accent-gold transition-colors">{name.name}</p>
            <div>
              <p className="text-[10px] text-text-primary font-medium tracking-tight">{name.transliteration}</p>
              <p className="text-[9px] text-text-primary/40 uppercase tracking-tighter leading-tight">{name.en.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const NamesOfMuhammad = () => {
    return (
      <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right duration-300 pb-10">
        {NAMES_OF_MUHAMMAD.map((name, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl text-center space-y-2 group hover:border-accent-gold/30 transition-colors">
            <p className="arabic-text text-2xl text-white group-hover:text-accent-gold transition-colors">{name.name}</p>
            <div>
              <p className="text-xs font-bold text-accent-gold">{name.transliteration}</p>
              <p className={cn(
                "text-[9px] text-text-primary/40 leading-tight truncate",
                language === 'ur' ? "urdu-text text-[10px]" : "uppercase tracking-tighter"
              )}>
                {language === 'ur' ? name.ur.meaning : name.en.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const categories = [
    {
      title: language === 'en' ? 'Tools & Utilities' : 'ٹولز اور افادیت',
      items: [
        { id: 'zakat', name: t.zakat, icon: Calculator, desc: language === 'en' ? 'Calculate your annual Zakat easily' : 'اپنی سالانہ زکوٰۃ کا آسانی سے حساب لگائیں', color: 'text-accent-gold' },
        { id: 'names', name: t.names, icon: Sparkles, desc: t.asmaMeaning, color: 'text-blue-400' },
        { id: 'muhammad_names', name: t.muhammadNames, icon: Star, desc: t.muhammadMeaning, color: 'text-green-400' },
      ]
    },
    {
      title: language === 'en' ? 'Support & Share' : 'سپورٹ اور شیئر',
      items: [
        { id: 'theme', name: t.theme, icon: theme === 'dark' ? Moon : Sun, desc: t.themeNote, color: 'text-yellow-400' },
        { id: 'language', name: t.language, icon: Globe, desc: language === 'en' ? 'English & Urdu translation' : 'انگریزی اور اردو ترجمہ', color: 'text-purple-400' },
        { id: 'share', name: t.share, icon: Share2, desc: language === 'en' ? 'Spread the word with friends' : 'دوستوں کے ساتھ ایپ شیئر کریں', color: 'text-orange-400' },
        { id: 'contact', name: t.contact, icon: HelpCircle, desc: language === 'en' ? 'Feedback and bug reports' : 'تاثرات اور بگ رپورٹس', color: 'text-text-primary/60' },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => currentView === 'list' ? onBack() : setCurrentView('list')}
          className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-sans text-accent-gold font-bold tracking-tight uppercase">
            {currentView === 'list' ? t.moreTools : 
             currentView === 'zakat' ? t.zakat : 
             currentView === 'names' ? (language === 'ur' ? 'اللہ کے نام' : 'Names of Allah') : 
             currentView === 'muhammad_names' ? (language === 'ur' ? 'محمد ﷺ کے نام' : 'Muhammad PBUH Names') : 
             currentView === 'theme' ? t.theme : t.settings}
          </h2>
          <p className="text-text-primary/40 text-[10px] uppercase tracking-widest font-bold">
            {currentView === 'list' ? t.manage : 'Utility Tool'}
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentView === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Profile Section */}
            <section className="glass-card rounded-[2.5rem] p-6 flex items-center gap-6 border-accent-gold/10">
              <div className="w-16 h-16 rounded-full bg-accent-gold flex items-center justify-center text-bg-primary font-bold text-xl shadow-lg border-4 border-white/5 shrink-0">
                ST
              </div>
              <div>
                <h3 className="text-lg font-sans font-bold text-text-primary">Shawaiz Technomites</h3>
                <p className="text-[10px] text-accent-gold uppercase tracking-[0.2em] font-bold flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-accent-gold" />
                  {t.premium}
                </p>
              </div>
            </section>

            <div className="space-y-8 pb-10">
              {categories.map((cat) => (
                <div key={cat.title} className="space-y-4">
                  <h3 className="px-2 text-[10px] font-bold uppercase tracking-[0.3em] text-text-primary/20">
                    {cat.title}
                  </h3>
                  <div className="space-y-3">
                    {cat.items.map((item) => (
                      <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => ['zakat', 'names', 'muhammad_names', 'language', 'theme'].includes(item.id) && setCurrentView(item.id as ToolView)}
                        className="w-full glass-card p-5 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-5 text-left">
                          <div className={cn("w-12 h-12 rounded-2xl bg-bg-primary/50 border border-border-main flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary text-sm">{item.name}</h4>
                            <p className="text-[10px] text-text-primary/40 font-sans italic mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-primary/20 group-hover:text-accent-gold transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {currentView === 'zakat' && <ZakatCalculator />}
            {currentView === 'names' && <NamesOfAllah />}
            {currentView === 'muhammad_names' && <NamesOfMuhammad />}
            {currentView === 'theme' && (
              <div className="glass-card p-6 rounded-3xl space-y-6">
                <p className="text-xs font-bold text-text-primary/60 uppercase tracking-widest text-center">{t.themeTitle}</p>
                <div className="grid grid-cols-1 gap-3">
                   <button 
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "w-full p-6 rounded-2xl border flex items-center justify-between transition-all",
                      theme === 'dark' ? "bg-accent-gold text-bg-primary border-accent-gold font-bold" : "bg-bg-primary text-text-primary border-border-main"
                    )}
                   >
                     <div className="flex items-center gap-3">
                       <Moon className="w-5 h-5" />
                       <span>{t.dark}</span>
                     </div>
                     {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-bg-primary" />}
                   </button>
                   <button 
                    onClick={() => setTheme('light')}
                    className={cn(
                      "w-full p-6 rounded-2xl border flex items-center justify-between transition-all",
                      theme === 'light' ? "bg-accent-gold text-bg-primary border-accent-gold font-bold" : "bg-bg-primary text-text-primary border-border-main"
                    )}
                   >
                     <div className="flex items-center gap-3">
                       <Sun className="w-5 h-5" />
                       <span>{t.light}</span>
                     </div>
                     {theme === 'light' && <div className="w-2 h-2 rounded-full bg-bg-primary" />}
                   </button>
                </div>
                <p className="text-[10px] text-text-primary/30 text-center font-sans italic">{t.themeNote}</p>
              </div>
            )}
            {currentView === 'language' && (
              <div className="glass-card p-6 rounded-3xl space-y-6">
                <p className="text-xs font-bold text-text-primary/60 uppercase tracking-widest text-center">{t.globalLang}</p>
                <div className="grid grid-cols-1 gap-3">
                   <button 
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "w-full p-6 rounded-2xl border flex items-center justify-between transition-all",
                      language === 'en' ? "bg-accent-gold text-bg-primary border-accent-gold" : "bg-bg-primary text-text-primary border-border-main"
                    )}
                   >
                     <span className="font-bold">English</span>
                     {language === 'en' && <div className="w-2 h-2 rounded-full bg-bg-primary" />}
                   </button>
                   <button 
                    onClick={() => setLanguage('ur')}
                    className={cn(
                      "w-full p-6 rounded-2xl border flex items-center justify-between transition-all",
                      language === 'ur' ? "bg-accent-gold text-bg-primary border-accent-gold font-bold" : "bg-bg-primary text-text-primary border-border-main"
                    )}
                   >
                     <span className="urdu-text text-xl">اردو (Urdu)</span>
                     {language === 'ur' && <div className="w-2 h-2 rounded-full bg-bg-primary" />}
                   </button>
                </div>
                <p className="text-[10px] text-text-primary/30 text-center font-sans italic">{t.langNote}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-text-primary/20 text-[10px] uppercase font-bold tracking-widest mb-2 font-mono">
           <ShieldCheck className="w-3 h-3" />
           Privacy First • No Ads
        </div>
        <p className="text-text-primary/10 text-[9px] font-mono tracking-widest">
          V 1.0.0 • KAIFIYAT • DEVELOPED BY SHAWAIZ AHMED
        </p>
      </footer>
    </div>
  );
}
