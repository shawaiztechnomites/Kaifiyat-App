import { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Share2,
  Bluetooth,
  MessageCircle,
  Send,
  Mail,
  Copy,
  Check,
  Smartphone,
  Upload,
  X,
  AlertCircle,
  Download,
  Loader2
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { cn } from '../lib/utils';

interface Props {
  language: 'en' | 'ur';
}

const API_BASE = Capacitor.isNativePlatform()
  ? (import.meta.env.VITE_API_BASE_URL || 'https://ais-pre-lzcux3meopcwkk3h2qnxqk-901985584736.asia-southeast1.run.app')
  : '';

export default function ShareApp({ language }: Props) {
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [serverApkInfo, setServerApkInfo] = useState<{ available: boolean; filename: string; sizeBytes?: number } | null>(null);
  const [isPreparingApkShare, setIsPreparingApkShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const apkDownloadUrl = `${API_BASE}/api/download-apk`;

  useEffect(() => {
    fetch(`${API_BASE}/api/apk-info`)
      .then((res) => res.json())
      .then((data) => setServerApkInfo(data))
      .catch(() => setServerApkInfo({ available: false, filename: 'Kaifiyat-debug.apk' }));
  }, []);

  const t = {
    en: {
      heroTitle: 'Share Kaifiyat App',
      heroDesc: 'Invite friends & family or send the APK directly via WhatsApp, Bluetooth, Nearby Share, and more.',
      nativeShareBtn: 'Share via WhatsApp, Bluetooth & Apps',
      downloadApkTitle: 'Kaifiyat Android APK',
      downloadApkBtn: 'Download APK',
      shareBuiltApkBtn: 'Send APK via Bluetooth / WhatsApp',
      preparingApk: 'Preparing APK...',
      apkSectionTitle: 'Or Pick Local APK File (.apk)',
      apkSectionDesc: 'Choose any .apk package from your device storage to send over Bluetooth, WhatsApp, or Nearby Share.',
      selectApk: 'Choose .apk File',
      sendApk: 'Send APK via Bluetooth / WhatsApp',
      removeApk: 'Remove',
      quickChannels: 'Quick Share Channels',
      whatsapp: 'WhatsApp',
      bluetooth: 'Bluetooth / Nearby',
      telegram: 'Telegram',
      email: 'Email',
      copyLabel: 'App Link',
      copy: 'Copy',
      copied: 'Copied',
      shareText: 'Assalamu Alaikum! Try Kaifiyat — Quran, Prayer Times, Daily Azkar & Tasbeeh companion:',
      emailSubject: 'Kaifiyat Islamic App & APK',
      shareSuccess: 'Share sheet opened! Choose WhatsApp, Bluetooth, or another app.',
      apkReady: 'APK ready to send via Bluetooth, WhatsApp, or Nearby Share.',
      fileShareUnsupported: 'Your current browser cannot send raw APK files directly. Sharing the APK download link instead — or download the APK first and share via Bluetooth/WhatsApp.',
      nativeUnsupported: 'System share sheet is unavailable on this browser. Please use WhatsApp, Telegram, Email, or Copy Link below.',
      invalidApk: 'Please select a valid .apk Android package file.',
    },
    ur: {
      heroTitle: 'کیفیت ایپ شیئر کریں',
      heroDesc: 'دوستوں اور اہلِ خانہ کو دعوت دیں یا واٹس ایپ، بلوٹوتھ اور دیگر ایپس کے ذریعے براہِ راست APK بھیجیں۔',
      nativeShareBtn: 'واٹس ایپ، بلوٹوتھ اور دیگر ایپس سے شیئر کریں',
      downloadApkTitle: 'کیفیت اینڈرائیڈ APK',
      downloadApkBtn: 'APK ڈاؤن لوڈ کریں',
      shareBuiltApkBtn: 'بلوٹوتھ / واٹس ایپ سے APK بھیجیں',
      preparingApk: 'APK تیار ہو رہی ہے...',
      apkSectionTitle: 'یا فون سے APK فائل منتخب کریں (.apk)',
      apkSectionDesc: 'بلوٹوتھ، واٹس ایپ یا نیئربائی شیئر کے ذریعے بھیجنے کے لیے اپنے فون سے .apk فائل منتخب کریں۔',
      selectApk: '.apk فائل منتخب کریں',
      sendApk: 'بلوٹوتھ / واٹس ایپ سے APK بھیجیں',
      removeApk: 'ہٹائیں',
      quickChannels: 'فوری شیئر ذرائع',
      whatsapp: 'واٹس ایپ',
      bluetooth: 'بلوٹوتھ / نیئربائی',
      telegram: 'ٹیلی گرام',
      email: 'ای میل',
      copyLabel: 'ایپ لنک',
      copy: 'کاپی',
      copied: 'کاپی ہو گیا',
      shareText: 'السلام علیکم! کیفیت ایپ استعمال کریں — قرآن، نماز کے اوقات، روزانہ اذکار اور تسبیح:',
      emailSubject: 'کیفیت اسلامی ایپ اور APK',
      shareSuccess: 'شیئر مینو کھل گیا! واٹس ایپ، بلوٹوتھ یا کوئی اور ایپ منتخب کریں۔',
      apkReady: 'APK فائل بلوٹوتھ یا واٹس ایپ کے ذریعے بھیجنے کے لیے تیار ہے۔',
      fileShareUnsupported: 'یہ براؤزر براہِ راست APK فائل شیئر کرنے کی سہولت نہیں دیتا۔ APK لنک شیئر کیا جا رہا ہے، یا پہلے APK ڈاؤن لوڈ کر کے بلوٹوتھ/واٹس ایپ سے بھیجیں۔',
      nativeUnsupported: 'اس براؤزر میں سسٹم شیئر دستیاب نہیں ہے۔ براہِ کرم نیچے واٹس ایپ، ٹیلی گرام یا لنک کاپی استعمال کریں۔',
      invalidApk: 'براہ کرم درست .apk اینڈرائیڈ فائل منتخب کریں۔',
    },
  }[language];

  const fullShareMessage = `${t.shareText} ${appUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(fullShareMessage)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(t.shareText)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(t.emailSubject)}&body=${encodeURIComponent(fullShareMessage)}`;

  const handleApkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      setStatusMessage({ type: 'error', text: t.invalidApk });
      return;
    }

    setApkFile(file);
    setStatusMessage({ type: 'info', text: t.apkReady });
  };

  const handleNativeShare = async (preferApk = false) => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      setStatusMessage({ type: 'info', text: t.nativeUnsupported });
      return;
    }

    try {
      if (apkFile && preferApk) {
        const canShareFiles =
          typeof navigator.canShare === 'function' && navigator.canShare({ files: [apkFile] });

        if (canShareFiles) {
          await navigator.share({
            title: 'Kaifiyat APK',
            text: t.shareText,
            files: [apkFile],
          });
          setStatusMessage({ type: 'success', text: t.shareSuccess });
          return;
        } else {
          setStatusMessage({ type: 'info', text: t.fileShareUnsupported });
        }
      }

      await navigator.share({
        title: 'Kaifiyat — Spiritual Companion',
        text: t.shareText,
        url: appUrl,
      });
      setStatusMessage({ type: 'success', text: t.shareSuccess });
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setStatusMessage({ type: 'info', text: t.nativeUnsupported });
      }
    }
  };

  const handleShareServerApk = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      setStatusMessage({ type: 'info', text: t.nativeUnsupported });
      return;
    }

    setIsPreparingApkShare(true);
    try {
      const response = await fetch(apkDownloadUrl);
      if (!response.ok) throw new Error('Failed to load APK');
      const blob = await response.blob();
      const file = new File([blob], serverApkInfo?.filename || 'Kaifiyat-debug.apk', {
        type: 'application/vnd.android.package-archive',
      });

      const canShareFiles =
        typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

      if (canShareFiles) {
        await navigator.share({
          title: 'Kaifiyat Android APK',
          text: t.shareText,
          files: [file],
        });
        setStatusMessage({ type: 'success', text: t.shareSuccess });
      } else {
        setStatusMessage({ type: 'info', text: t.fileShareUnsupported });
        await navigator.share({
          title: 'Kaifiyat Android APK',
          text: t.shareText,
          url: `${window.location.origin}/api/download-apk`,
        });
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setStatusMessage({ type: 'info', text: t.fileShareUnsupported });
      }
    } finally {
      setIsPreparingApkShare(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setStatusMessage({ type: 'error', text: 'Clipboard unavailable' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Share Card */}
      <div className="glass-card p-6 rounded-3xl space-y-5 border-accent-gold/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center text-accent-gold shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className={cn("text-lg font-bold text-text-primary", language === 'ur' && "urdu-text")}>
              {t.heroTitle}
            </h3>
            <p className={cn("text-xs text-text-primary/60 leading-relaxed", language === 'ur' && "urdu-text")}>
              {t.heroDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleNativeShare(false)}
          className="w-full py-4 px-5 rounded-2xl bg-accent-gold text-bg-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity shadow-lg"
        >
          <Share2 className="w-4 h-4" />
          <span className={cn(language === 'ur' && "urdu-text text-sm normal-case tracking-normal")}>
            {t.nativeShareBtn}
          </span>
        </button>
      </div>

      {/* Built Kaifiyat APK Download & Share Card */}
      {serverApkInfo?.available && (
        <div className="glass-card p-6 rounded-3xl space-y-4 border-green-500/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className={cn("text-sm font-bold text-text-primary", language === 'ur' && "urdu-text")}>
                  {t.downloadApkTitle}
                </h4>
                <p className="text-[11px] font-mono text-accent-gold truncate">
                  {serverApkInfo.filename}
                  {serverApkInfo.sizeBytes ? ` • ${formatFileSize(serverApkInfo.sizeBytes)}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={apkDownloadUrl}
              download={serverApkInfo.filename}
              className="w-full py-3.5 px-4 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-green-500/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className={cn(language === 'ur' && "urdu-text text-sm normal-case tracking-normal")}>
                {t.downloadApkBtn}
              </span>
            </a>

            <button
              type="button"
              disabled={isPreparingApkShare}
              onClick={handleShareServerApk}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              {isPreparingApkShare ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bluetooth className="w-4 h-4" />
              )}
              <span className={cn(language === 'ur' && "urdu-text text-sm normal-case tracking-normal")}>
                {isPreparingApkShare ? t.preparingApk : t.shareBuiltApkBtn}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* APK File Sharing Card (Bluetooth / WhatsApp / Nearby) */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h4 className={cn("text-sm font-bold text-text-primary", language === 'ur' && "urdu-text")}>
              {t.apkSectionTitle}
            </h4>
            <p className={cn("text-[11px] text-text-primary/50 mt-0.5 leading-relaxed", language === 'ur' && "urdu-text")}>
              {t.apkSectionDesc}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".apk,application/vnd.android.package-archive"
          onChange={handleApkChange}
          className="hidden"
        />

        {apkFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-bg-primary border border-accent-gold/30">
              <div className="min-w-0">
                <p className="text-xs font-mono font-bold text-accent-gold truncate">{apkFile.name}</p>
                <p className="text-[10px] text-text-primary/50 font-mono">{formatFileSize(apkFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setApkFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  setStatusMessage(null);
                }}
                className="p-2 rounded-xl text-text-primary/50 hover:text-red-400 transition-colors"
                title={t.removeApk}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleNativeShare(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors"
            >
              <Bluetooth className="w-4 h-4" />
              <span className={cn(language === 'ur' && "urdu-text text-sm normal-case tracking-normal")}>
                {t.sendApk}
              </span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 px-4 rounded-2xl bg-bg-primary border border-dashed border-border-main hover:border-accent-gold/50 text-text-primary/80 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-accent-gold" />
            <span className={cn(language === 'ur' && "urdu-text text-sm")}>{t.selectApk}</span>
          </button>
        )}
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={cn(
            "p-4 rounded-2xl border text-xs flex items-start gap-2.5",
            statusMessage.type === 'success'
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : statusMessage.type === 'error'
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-accent-gold/10 border-accent-gold/30 text-accent-gold"
          )}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className={cn("leading-relaxed", language === 'ur' && "urdu-text")}>{statusMessage.text}</p>
        </div>
      )}

      {/* Quick Share Channels */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-primary/40 px-1">
          {t.quickChannels}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-green-500/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className={cn("text-xs font-bold text-text-primary group-hover:text-green-400 transition-colors", language === 'ur' && "urdu-text")}>
              {t.whatsapp}
            </span>
          </a>

          <button
            type="button"
            onClick={() => handleNativeShare(Boolean(apkFile))}
            className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-blue-400/40 transition-colors group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Bluetooth className="w-5 h-5" />
            </div>
            <span className={cn("text-xs font-bold text-text-primary group-hover:text-blue-400 transition-colors", language === 'ur' && "urdu-text")}>
              {t.bluetooth}
            </span>
          </button>

          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-sky-400/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <span className={cn("text-xs font-bold text-text-primary group-hover:text-sky-400 transition-colors", language === 'ur' && "urdu-text")}>
              {t.telegram}
            </span>
          </a>

          <a
            href={emailHref}
            className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-accent-gold/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-gold/15 text-accent-gold flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <span className={cn("text-xs font-bold text-text-primary group-hover:text-accent-gold transition-colors", language === 'ur' && "urdu-text")}>
              {t.email}
            </span>
          </a>
        </div>
      </div>

      {/* Copy App Link */}
      <div className="glass-card p-4 rounded-2xl space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-primary/40">{t.copyLabel}</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={appUrl}
            className="flex-1 bg-bg-primary border border-border-main rounded-xl px-3 py-2.5 text-xs font-mono text-text-primary/70 outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0",
              copied
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-accent-gold text-bg-primary hover:opacity-90"
            )}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copied : t.copy}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
