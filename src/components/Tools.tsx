import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
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
  Globe,
  HelpCircle,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  WifiOff
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NAMES_OF_MUHAMMAD } from '../constants/names';
import { getAsmaAlHusna } from '../services/api';
import { auth, signInWithGoogle, signInWithFacebook, logout, onAuthStateChanged, User } from '../services/firebase';

const ShareApp = lazy(() => import('./ShareApp'));
const ContactForm = lazy(() => import('./ContactForm'));

interface Props {
  onBack: () => void;
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

type ToolView = 'list' | 'zakat' | 'names' | 'muhammad_names' | 'language' | 'theme' | 'share' | 'contact';

const SubviewFallback = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-8 h-8 text-accent-gold animate-spin" />
  </div>
);

function ZakatCalculator({
  cashLabel,
  goldLabel,
  calculatedLabel,
  noteText,
}: {
  cashLabel: string;
  goldLabel: string;
  calculatedLabel: string;
  noteText: string;
}) {
  const [cash, setCash] = useState('');
  const [gold, setGold] = useState('');
  const result = (Number(cash || 0) + Number(gold || 0)) * 0.025;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">{cashLabel}</label>
          <input
            type="number"
            placeholder="0.00"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            className="w-full bg-bg-primary border border-border-main rounded-2xl p-4 text-text-primary outline-none focus:border-accent-gold/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">{goldLabel}</label>
          <input
            type="number"
            placeholder="0.00"
            value={gold}
            onChange={(e) => setGold(e.target.value)}
            className="w-full bg-bg-primary border border-border-main rounded-2xl p-4 text-text-primary outline-none focus:border-accent-gold/40"
          />
        </div>
        <div className="pt-4 border-t border-border-main">
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-primary/40 mb-1">{calculatedLabel}</p>
          <p className="text-4xl font-mono font-bold text-accent-gold">
            {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-text-primary/40 font-sans italic text-center px-4">{noteText}</p>
    </div>
  );
}

function NamesOfAllah({
  names,
  isLoading,
  error,
  onRetry,
  language,
}: {
  names: any[];
  isLoading: boolean;
  error: boolean;
  onRetry: () => void;
  language: 'en' | 'ur';
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent-gold animate-spin" />
      </div>
    );
  }

  if (error || names.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <WifiOff className="w-10 h-10 text-accent-gold/60" />
        <p className="text-sm text-text-primary/70 max-w-xs">
          {language === 'ur'
            ? 'اسماء الحسنٰی لوڈ نہیں ہو سکے۔ براہ کرم انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔'
            : 'Unable to load Asma-ul-Husna. Please check your internet connection.'}
        </p>
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-accent-gold text-bg-primary text-xs font-bold uppercase tracking-wider"
        >
          {language === 'ur' ? 'دوبارہ کوشش کریں' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 pb-10">
      {names.map((name, i) => (
        <div key={i} className="glass-card p-4 rounded-2xl text-center space-y-2 group hover:border-accent-gold/30 transition-colors">
          <p className="arabic-text text-2xl text-text-primary group-hover:text-accent-gold transition-colors">{name.name}</p>
          <div>
            <p className="text-[10px] text-text-primary font-medium tracking-tight">{name.transliteration}</p>
            <p className="text-[9px] text-text-primary/40 uppercase tracking-tighter leading-tight">{name.en.meaning}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NamesOfMuhammad({ language }: { language: 'en' | 'ur' }) {
  return (
    <div className="grid grid-cols-2 gap-3 pb-10">
      {NAMES_OF_MUHAMMAD.map((name, i) => (
        <div key={i} className="glass-card p-4 rounded-2xl text-center space-y-2 group hover:border-accent-gold/30 transition-colors">
          <p className="arabic-text text-2xl text-text-primary group-hover:text-accent-gold transition-colors">{name.name}</p>
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
}

export default function Tools({ onBack, language, setLanguage, theme, setTheme }: Props) {
  const [currentView, setCurrentView] = useState<ToolView>('list');
  const [asmaAlHusna, setAsmaAlHusna] = useState<any[]>([]);
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  const [namesError, setNamesError] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
      back: 'back',
      premium: 'Soul Member',
      loginTitle: 'Join the Community',
      loginSubtitle: 'Signup or Login to sync your progress',
      googleLogin: 'Continue with Google',
      facebookLogin: 'Continue with Facebook',
      logout: 'Logout',
      guest: 'Guest User'
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
      back: 'واپس',
      premium: 'روحانی رکن',
      loginTitle: 'کمیونٹی میں شامل ہوں',
      loginSubtitle: 'اپنی پیشرفت کو ہم آہنگ کرنے کے لیے سائن اپ یا لاگ ان کریں',
      googleLogin: 'گوگل کے ساتھ جاری رکھیں',
      facebookLogin: 'فیس بک کے ساتھ جاری رکھیں',
      logout: 'لاگ آؤٹ',
      guest: 'مہمان صارف'
    }
  }[language];

  const loadNames = useCallback(async () => {
    setIsLoadingNames(true);
    setNamesError(false);
    try {
      const data = await getAsmaAlHusna();
      setAsmaAlHusna(data);
    } catch {
      setNamesError(true);
    } finally {
      setIsLoadingNames(false);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'names' && asmaAlHusna.length === 0) {
      loadNames();
    }
  }, [currentView, asmaAlHusna.length, loadNames]);

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
             currentView === 'share' ? t.share :
             currentView === 'contact' ? t.contact :
             currentView === 'theme' ? t.theme : t.settings}
          </h2>
          <p className="text-text-primary/40 text-[10px] uppercase tracking-widest font-bold">
            {currentView === 'list' ? t.manage : 'Utility Tool'}
          </p>
        </div>
      </header>

      {currentView === 'list' ? (
        <div className="space-y-8">
          {/* Profile/Auth Section */}
          <section className="glass-card rounded-[2.5rem] p-6 border-accent-gold/10">
            {isAuthLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 text-accent-gold animate-spin" />
              </div>
            ) : user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-accent-gold overflow-hidden flex items-center justify-center border-4 border-white/5 shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-bg-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-sans font-bold text-text-primary line-clamp-1">{user.displayName || t.guest}</h3>
                    <p className="text-[10px] text-accent-gold uppercase tracking-[0.2em] font-bold flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-accent-gold" />
                      {t.premium}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-colors"
                  title={t.logout}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-sans font-bold text-text-primary uppercase tracking-tight">{t.loginTitle}</h3>
                  <p className="text-[10px] text-text-primary/40 font-medium">{t.loginSubtitle}</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => signInWithGoogle()}
                    className="w-full py-4 px-6 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-colors text-sm"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                    {t.googleLogin}
                  </button>
                  <button
                    onClick={() => signInWithFacebook()}
                    className="w-full py-4 px-6 rounded-2xl bg-[#1877F2] text-white font-bold flex items-center justify-center gap-3 hover:bg-[#1877F2]/90 transition-colors text-sm"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    {t.facebookLogin}
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="space-y-8 pb-10">
            {categories.map((cat) => (
              <div key={cat.title} className="space-y-4">
                <h3 className="px-2 text-[10px] font-bold uppercase tracking-[0.3em] text-text-primary/20">
                  {cat.title}
                </h3>
                <div className="space-y-3">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as ToolView)}
                      className="w-full glass-card p-5 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-transform active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-5 text-left">
                        <div className={cn("w-12 h-12 rounded-2xl bg-bg-primary/50 border border-border-main flex items-center justify-center", item.color)}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary text-sm">{item.name}</h4>
                          <p className="text-[10px] text-text-primary/40 font-sans italic mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-primary/20 group-hover:text-accent-gold transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {currentView === 'zakat' && (
            <ZakatCalculator
              cashLabel={t.cash}
              goldLabel={t.gold}
              calculatedLabel={t.calculated}
              noteText={t.zakatNote}
            />
          )}
          {currentView === 'names' && (
            <NamesOfAllah
              names={asmaAlHusna}
              isLoading={isLoadingNames}
              error={namesError}
              onRetry={loadNames}
              language={language}
            />
          )}
          {currentView === 'muhammad_names' && <NamesOfMuhammad language={language} />}
          {currentView === 'share' && (
            <Suspense fallback={<SubviewFallback />}>
              <ShareApp language={language} />
            </Suspense>
          )}
          {currentView === 'contact' && (
            <Suspense fallback={<SubviewFallback />}>
              <ContactForm
                language={language}
                defaultEmail={user?.email || ''}
                defaultName={user?.displayName || ''}
              />
            </Suspense>
          )}
          {currentView === 'theme' && (
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <p className="text-xs font-bold text-text-primary/60 uppercase tracking-widest text-center">{t.themeTitle}</p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "w-full p-6 rounded-2xl border flex items-center justify-between transition-colors",
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
                    "w-full p-6 rounded-2xl border flex items-center justify-between transition-colors",
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
                    "w-full p-6 rounded-2xl border flex items-center justify-between transition-colors",
                    language === 'en' ? "bg-accent-gold text-bg-primary border-accent-gold" : "bg-bg-primary text-text-primary border-border-main"
                  )}
                >
                  <span className="font-bold">English</span>
                  {language === 'en' && <div className="w-2 h-2 rounded-full bg-bg-primary" />}
                </button>
                <button
                  onClick={() => setLanguage('ur')}
                  className={cn(
                    "w-full p-6 rounded-2xl border flex items-center justify-between transition-colors",
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
        </div>
      )}

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
