import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Info, RefreshCw } from 'lucide-react';
import { getQiblaDirection } from '../services/api';
import { cn } from '../lib/utils';

interface Props {
  location: { lat: number; lng: number } | null;
  language: 'en' | 'ur';
}

export default function QiblaFinder({ location, language }: Props) {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const t = {
    en: {
      title: 'Qibla Finder',
      sub: 'Direction to Kaaba',
      relNorth: 'Relative to North',
      calc: 'Calculating direction...',
      howTo: 'How to use',
      instr: 'Hold your phone flat. Rotate until the gold indicator aligns with the top of your screen. Allow location and orientation permissions for accuracy.',
      notSupported: 'Device Orientation API not supported'
    },
    ur: {
      title: 'قبلہ رخ',
      sub: 'کعبہ کی سمت',
      relNorth: 'شمال سے نسبت',
      calc: 'سمت کا حساب لگایا جا رہا ہے...',
      howTo: 'استعمال کرنے کا طریقہ',
      instr: 'اپنا فون سیدھا رکھیں۔ گھومیں جب تک کہ سنہری نشان آپ کی اسکرین کے اوپری حصے کے ساتھ نہ مل جائے۔ درستگی کے لیے لوکیشن اور اورینٹیشن کی اجازت دیں۔',
      notSupported: 'ڈیوائس اورینٹیشن API دستیاب نہیں ہے'
    }
  }[language];

  useEffect(() => {
    if (location) {
      getQiblaDirection(location.lat, location.lng).then(setQiblaAngle);
    }
    
    // Handle device orientation
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore - webkitCompassHeading is real in some environments
      const heading = e.webkitCompassHeading || e.alpha || 0;
      setDeviceHeading(heading);
    };

    if (window.DeviceOrientationEvent) {
       // Request permission for iOS
       if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
         (DeviceOrientationEvent as any).requestPermission()
           .then((permissionState: string) => {
             if (permissionState === 'granted') {
               window.addEventListener('deviceorientation', handleOrientation);
             } else {
               setIsSupported(false);
             }
           });
       } else {
         window.addEventListener('deviceorientation', handleOrientation);
       }
    } else {
      setIsSupported(false);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [location]);

  const rotation = qiblaAngle ? qiblaAngle - deviceHeading : 0;

  return (
    <div className="h-full flex flex-col space-y-8">
      <header>
        <h2 className={cn("text-2xl font-bold", language === 'ur' ? "urdu-text" : "font-sans text-accent-gold")}>
          {t.title}
        </h2>
        <p className="text-text-primary/40 text-[10px] uppercase tracking-widest font-bold">{t.sub}</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12 pb-12">
        <div className="relative w-72 h-72">
          {/* Compass Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/5 shadow-2xl flex items-center justify-center grayscale opacity-20">
             {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-0.5 h-4 bg-gold-100" 
                  style={{ transform: `rotate(${i * 30}deg) translateY(-144px)` }} 
                />
             ))}
          </div>

          {/* Compass Needle Container */}
          <motion.div 
            animate={{ rotate: -deviceHeading }}
            className="absolute inset-0 flex items-center justify-center"
          >
             <div className="w-1 h-full bg-white/5 rounded-full absolute" />
             <div className="h-1 w-full bg-white/5 rounded-full absolute" />
             <span className="absolute top-2 text-[10px] font-bold text-gold-100/20">N</span>
             <span className="absolute bottom-2 text-[10px] font-bold text-gold-100/20">S</span>
             <span className="absolute left-2 text-[10px] font-bold text-gold-100/20">W</span>
             <span className="absolute right-2 text-[10px] font-bold text-gold-100/20">E</span>
          </motion.div>

          {/* Qibla Indicator */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative">
               <div className="w-1 h-32 bg-accent-gold rounded-full absolute -top-32 left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(197,160,89,0.5)]" />
               <div className="w-8 h-8 glass-card border-accent-gold rounded-lg flex items-center justify-center absolute -top-36 left-1/2 -translate-x-1/2 overflow-hidden bg-accent-gold">
                  <div className="w-4 h-4 bg-black rounded-sm" />
               </div>
               <div className="w-4 h-4 bg-accent-gold rounded-full border-4 border-bg-primary shadow-lg relative z-10" />
            </div>
          </motion.div>
        </div>

        <div className="text-center space-y-2">
          {qiblaAngle !== null ? (
            <>
               <p className="text-4xl font-mono font-bold text-text-primary leading-none">
                 {Math.round(qiblaAngle)}°
               </p>
               <p className="text-text-primary/40 text-[10px] uppercase font-bold tracking-[0.2em]">
                 Relative to North
               </p>
            </>
          ) : (
            <p className="text-text-primary/40 animate-pulse">{t.calc}</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-start gap-4">
           <Info className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
           <div className="space-y-1">
              <h4 className={cn("text-sm font-medium text-white", language === 'ur' && "urdu-text text-base")}>{t.howTo}</h4>
              <p className={cn("text-xs leading-relaxed italic", language === 'ur' ? "urdu-text text-sm opacity-60" : "text-text-primary/60 font-serif italic")}>
                {t.instr}
              </p>
           </div>
        </div>
        {!isSupported && (
           <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center py-2 bg-red-400/10 rounded-xl">
             {t.notSupported}
           </p>
        )}
      </div>
    </div>
  );
}
