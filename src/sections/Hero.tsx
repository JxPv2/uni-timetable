import { useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { dateLocale, useLang } from '@/lib/i18n';

export default function Hero() {
  const { t, lang } = useLang();
  const { events, status } = useEvents();

  const next = useMemo(() => {
    const now = Date.now();
    return events.find((e) => e.end.getTime() > now) ?? null;
  }, [events]);

  const courseCount = useMemo(() => new Set(events.map((e) => e.courseKey)).size, [events]);

  const fmtDay = new Intl.DateTimeFormat(dateLocale(lang), {
    timeZone: 'Europe/Rome',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const fmtTime = new Intl.DateTimeFormat(dateLocale(lang), {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  return (
    <section id="top" className="relative overflow-hidden">
      {/* faint grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40">
        <p className="rise-in rise-in-1 label-caps text-muted-foreground">{t('hero_kicker')}</p>

        <h1 className="rise-in rise-in-2 mt-5 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
          {t('hero_title_1')}
          <br />
          <span className="text-primary">{t('hero_title_2')}</span>
        </h1>

        <p className="rise-in rise-in-3 mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('hero_sub')}
        </p>

        <div className="rise-in rise-in-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#subscribe"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-primary px-7 font-display text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('hero_cta_subscribe')}
          </a>
          <a
            href="#calendar"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-foreground/20 px-7 font-display text-sm font-semibold transition-colors hover:border-foreground/50"
          >
            {t('hero_cta_browse')}
          </a>
        </div>

        {/* live stats + next lecture */}
        {status === 'ready' && (
          <div className="rise-in rise-in-3 mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="font-mono2 text-xs text-muted-foreground">
              <span className="text-foreground">{events.length}</span> {t('stats_lectures')}
              <span className="mx-2 text-border">·</span>
              <span className="text-foreground">{courseCount}</span> {t('stats_courses')}
              <span className="mx-2 text-border">·</span>
              {t('stats_updates')}
            </div>
          </div>
        )}

        {next && (
          <div className="rise-in rise-in-3 mt-6 inline-flex max-w-full flex-col gap-1 rounded-2xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
            <span className="label-caps text-primary">{t('next_up')}</span>
            <span className="font-display text-sm font-semibold">{next.course}</span>
            <span className="font-mono2 text-xs text-muted-foreground">
              {fmtDay.format(next.start)} · {fmtTime.format(next.start)}–{fmtTime.format(next.end)}
              {next.location ? ` · ${next.location}` : ''}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
