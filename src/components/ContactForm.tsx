import { useState, FormEvent } from 'react';
import { Capacitor } from '@capacitor/core';
import { Send, Loader2, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  language: 'en' | 'ur';
  defaultEmail?: string;
  defaultName?: string;
}

const CONTACT_API_URL = Capacitor.isNativePlatform()
  ? `${import.meta.env.VITE_API_BASE_URL || 'https://ais-pre-lzcux3meopcwkk3h2qnxqk-901985584736.asia-southeast1.run.app'}/api/contact`
  : '/api/contact';

export default function ContactForm({ language, defaultEmail = '', defaultName = '' }: Props) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<{
    status: 'idle' | 'success' | 'error';
    text?: string;
  }>({ status: 'idle' });

  const t = {
    en: {
      formTitle: 'Send Us a Query',
      formSubtitle: 'Have feedback, a bug report, or a question? Fill out the form below and our team will receive your message.',
      nameLabel: 'Your Name',
      namePlaceholder: 'Enter your name',
      emailLabel: 'Your Email',
      emailPlaceholder: 'you@example.com',
      topicLabel: 'Topic',
      topics: ['General Query', 'Bug Report', 'Feature Request', 'Quran / Prayer Feedback'],
      subjectLabel: 'Subject',
      subjectPlaceholder: 'What is this regarding?',
      messageLabel: 'Message',
      messagePlaceholder: 'Write your query or feedback here...',
      submitBtn: 'Send',
      sending: 'Sending...',
      successTitle: 'Query Sent!',
      successText: 'Thank you! Your query has been received and our team will get back to you soon.',
      sendAnother: 'Send Another Message',
      validationMissing: 'Please fill in your name, email, and message.',
      submitError: 'Unable to send your query right now. Please try again in a moment.',
    },
    ur: {
      formTitle: 'ہمیں پیغام بھیجیں',
      formSubtitle: 'کوئی سوال، رائے یا بگ رپورٹ ہے؟ نیچے فارم پُر کریں، آپ کا پیغام براہِ راست ہماری ٹیم تک پہنچ جائے گا۔',
      nameLabel: 'آپ کا نام',
      namePlaceholder: 'اپنا نام درج کریں',
      emailLabel: 'آپ کی ای میل',
      emailPlaceholder: 'you@example.com',
      topicLabel: 'موضوع',
      topics: ['عمومی سوال', 'بگ رپورٹ', 'نیا فیچر', 'قرآن / نماز فیڈبیک'],
      subjectLabel: 'عنوان',
      subjectPlaceholder: 'پیغام کا عنوان لکھیں',
      messageLabel: 'پیغام',
      messagePlaceholder: 'اپنا سوال یا رائے یہاں لکھیں...',
      submitBtn: 'بھیجیں',
      sending: 'بھیجا جا رہا ہے...',
      successTitle: 'پیغام بھیج دیا گیا!',
      successText: 'شکریہ! آپ کا پیغام موصول ہو گیا ہے، ہماری ٹیم جلد آپ سے رابطہ کرے گی۔',
      sendAnother: 'مزید پیغام بھیجیں',
      validationMissing: 'براہ کرم اپنا نام، ای میل اور پیغام درج کریں۔',
      submitError: 'اس وقت پیغام نہیں بھیجا جا سکا۔ براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔',
    },
  }[language];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setSubmitState({ status: 'error', text: t.validationMissing });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ status: 'idle' });

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || 'App Query',
          message: message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        setSubmitState({ status: 'success', text: t.successText });
        setSubject('');
        setMessage('');
      } else {
        setSubmitState({
          status: 'error',
          text: data.error || t.submitError,
        });
      }
    } catch {
      setSubmitState({
        status: 'error',
        text: t.submitError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="glass-card p-6 rounded-3xl space-y-5 border-accent-gold/20">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center text-accent-gold shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className={cn("text-lg font-bold text-text-primary", language === 'ur' && "urdu-text")}>
              {t.formTitle}
            </h3>
            <p className={cn("text-xs text-text-primary/50 mt-1 leading-relaxed", language === 'ur' && "urdu-text")}>
              {t.formSubtitle}
            </p>
          </div>
        </div>

        {submitState.status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className={cn("text-base font-bold text-text-primary", language === 'ur' && "urdu-text")}>
                {t.successTitle}
              </h4>
              <p className={cn("text-xs text-text-primary/60", language === 'ur' && "urdu-text")}>
                {submitState.text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitState({ status: 'idle' })}
              className="px-5 py-2.5 rounded-xl bg-accent-gold text-bg-primary text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              {t.sendAnother}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">
                {t.nameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full bg-bg-primary border border-border-main rounded-2xl px-4 py-3.5 text-sm text-text-primary outline-none focus:border-accent-gold/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">
                {t.emailLabel}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full bg-bg-primary border border-border-main rounded-2xl px-4 py-3.5 text-sm text-text-primary outline-none focus:border-accent-gold/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">
                {t.topicLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {t.topics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSubject(topic)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all",
                      subject === topic
                        ? "bg-accent-gold text-bg-primary border-accent-gold font-bold"
                        : "bg-bg-primary text-text-primary/70 border-border-main hover:border-accent-gold/40"
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">
                {t.subjectLabel}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t.subjectPlaceholder}
                className="w-full bg-bg-primary border border-border-main rounded-2xl px-4 py-3.5 text-sm text-text-primary outline-none focus:border-accent-gold/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold ml-1">
                {t.messageLabel}
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.messagePlaceholder}
                className="w-full bg-bg-primary border border-border-main rounded-2xl px-4 py-3.5 text-sm text-text-primary outline-none focus:border-accent-gold/50 resize-none"
              />
            </div>

            {submitState.status === 'error' && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{submitState.text}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-accent-gold text-bg-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.sending}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.submitBtn}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
