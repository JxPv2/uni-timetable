import { useState } from 'react';
import { FEED_HTTPS, FEED_WEBCAL, GOOGLE_SETTINGS, GOOGLE_SUB, OUTLOOK_SUB } from '@/hooks/useEvents';
import { useLang } from '@/lib/i18n';

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.98-.2 1.92-.86 3.23-.83 1.6.13 2.8.76 3.59 1.92-3.3 1.97-2.5 6.32.53 7.54-.62 1.63-1.42 3.24-2.43 3.54ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}
function OutlookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <path d="M3 9h18M8 2v4m8-4v4" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export default function Subscribe() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copyFeed = async () => {
    try {
      await navigator.clipboard.writeText(FEED_HTTPS);
    } catch {
      window.prompt('Copy this URL:', FEED_HTTPS);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const btnPrimary =
    'inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-foreground px-6 font-display text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]';
  const btnGhost =
    'inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full border border-foreground/20 px-6 font-display text-sm font-semibold transition-colors hover:border-foreground/50';

  return (
    <section id="subscribe" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="label-caps text-muted-foreground">{t('sub_kicker')}</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
          {t('sub_title')}
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">{t('sub_sub')}</p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {/* Apple */}
          <div className="flex flex-col gap-3 bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <AppleIcon />
              <h3 className="font-display text-lg font-semibold">{t('apple_title')}</h3>
            </div>
            <p className="flex-1 text-sm text-muted-foreground">{t('apple_note')}</p>
            <a href={FEED_WEBCAL} className={btnPrimary}>
              {t('apple_cta')}
            </a>
          </div>

          {/* Google */}
          <div className="flex flex-col gap-3 bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <GoogleIcon />
              <h3 className="font-display text-lg font-semibold">{t('google_title')}</h3>
            </div>
            <p className="flex-1 text-sm text-muted-foreground">
              {t('google_note')}{' '}
              <a href={GOOGLE_SETTINGS} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
                {t('google_fallback')}
              </a>
            </p>
            <a href={GOOGLE_SUB} target="_blank" rel="noreferrer" className={btnPrimary}>
              {t('google_cta')}
            </a>
          </div>

          {/* Outlook */}
          <div className="flex flex-col gap-3 bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <OutlookIcon />
              <h3 className="font-display text-lg font-semibold">{t('outlook_title')}</h3>
            </div>
            <p className="flex-1 text-sm text-muted-foreground">{t('outlook_note')}</p>
            <a href={OUTLOOK_SUB} target="_blank" rel="noreferrer" className={btnPrimary}>
              {t('outlook_cta')}
            </a>
          </div>

          {/* Universal */}
          <div className="flex flex-col gap-3 bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <LinkIcon />
              <h3 className="font-display text-lg font-semibold">{t('universal_title')}</h3>
            </div>
            <p className="flex-1 text-sm text-muted-foreground">{t('universal_note')}</p>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button onClick={copyFeed} className={btnPrimary}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? t('universal_copied') : t('universal_copy')}
              </button>
              <a href={FEED_HTTPS} download="uni-timetable.ics" className={btnGhost}>
                {t('universal_download')}
              </a>
            </div>
          </div>
        </div>

        <code className="mt-6 block overflow-x-auto whitespace-nowrap rounded-xl border border-border bg-card px-4 py-3 font-mono2 text-xs text-muted-foreground">
          {FEED_HTTPS}
        </code>
      </div>
    </section>
  );
}
