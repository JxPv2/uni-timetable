import { useMemo, useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import {
  addDays,
  courseColor,
  dateFromKey,
  dayKey,
  keyOf,
  mondayOf,
  todayKey,
  type CalEvent,
} from '@/lib/ics';
import { dateLocale, useLang } from '@/lib/i18n';
import MonthView from './MonthView';
import ProgramView from './ProgramView';
import WeekView from './WeekView';
import { groupByDay } from './shared';

type View = 'month' | 'week' | 'program';

function Chevron({ dir }: { dir: 'l' | 'r' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === 'l' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

export default function CalendarSection() {
  const { t, lang } = useLang();
  const { events, status, source, reload, courses, courseNames } = useEvents();

  const [view, setView] = useState<View>('week');
  const [cursor, setCursor] = useState<string | null>(null); // null = auto
  const [active, setActive] = useState<Set<string>>(new Set());
  const [touchedFilter, setTouchedFilter] = useState(false);

  const activeCourses = touchedFilter ? active : new Set(courses);

  // Auto cursor: today if inside feed range, otherwise first event day
  const autoCursor = useMemo(() => {
    if (events.length === 0) return todayKey();
    const tk = todayKey();
    const firstKey = dayKey(events[0].start);
    const lastKey = dayKey(events[events.length - 1].start);
    return tk >= firstKey && tk <= lastKey ? tk : firstKey;
  }, [events]);

  const cur = cursor ?? autoCursor;

  const filtered = useMemo(
    () => events.filter((e) => activeCourses.has(e.courseKey)),
    [events, activeCourses]
  );
  const eventsByDay = useMemo(() => groupByDay(filtered), [filtered]);

  const colorOf = (e: CalEvent) => courseColor(e.courseKey, courses);

  /* ---------- navigation ---------- */
  const navigate = (dir: -1 | 1) => {
    if (view === 'month') {
      const d = dateFromKey(cur);
      const nm = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + dir, 1, 12));
      setCursor(keyOf(nm.getUTCFullYear(), nm.getUTCMonth() + 1, 1));
    } else if (view === 'week') {
      setCursor(addDays(mondayOf(cur), dir * 7));
    }
  };
  const goToday = () => setCursor(todayKey());

  /* ---------- period label ---------- */
  const periodLabel = useMemo(() => {
    const d = dateFromKey(cur);
    if (view === 'month') {
      return new Intl.DateTimeFormat(dateLocale(lang), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
    }
    if (view === 'week') {
      const start = dateFromKey(mondayOf(cur));
      const end = dateFromKey(addDays(mondayOf(cur), 6));
      const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', timeZone: 'UTC' };
      const optsY: Intl.DateTimeFormatOptions = { ...opts, year: 'numeric' };
      return `${new Intl.DateTimeFormat(dateLocale(lang), opts).format(start)} – ${new Intl.DateTimeFormat(dateLocale(lang), optsY).format(end)}`;
    }
    return '';
  }, [cur, view, lang]);

  const toggleCourse = (ck: string) => {
    setTouchedFilter(true);
    setActive((prev) => {
      const base = touchedFilter ? new Set(prev) : new Set(courses);
      if (base.has(ck)) base.delete(ck);
      else base.add(ck);
      return base;
    });
  };
  const resetCourses = () => {
    setTouchedFilter(false);
    setActive(new Set());
  };

  const weekStart = mondayOf(cur);

  return (
    <section id="calendar" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-caps text-muted-foreground">{t('cal_kicker')}</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
              {t('cal_title')}
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{t('cal_sub')}</p>
          </div>
          {status === 'ready' && source && (
            <span className="label-caps flex items-center gap-2 text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {source === 'live' ? t('feed_source_live') : t('feed_source_snapshot')}
            </span>
          )}
        </div>

        {/* controls */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {view !== 'program' && (
              <>
                <button
                  onClick={() => navigate(-1)}
                  aria-label="Previous"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
                >
                  <Chevron dir="l" />
                </button>
                <button
                  onClick={() => navigate(1)}
                  aria-label="Next"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
                >
                  <Chevron dir="r" />
                </button>
              </>
            )}
            <button
              onClick={goToday}
              className="min-h-[40px] rounded-full border border-border px-4 font-display text-xs font-semibold transition-colors hover:bg-secondary"
            >
              {t('today')}
            </button>
            {periodLabel && (
              <span className="ml-1 font-display text-sm font-semibold capitalize">{periodLabel}</span>
            )}
          </div>

          {/* view switcher */}
          <div className="flex rounded-full border border-border p-0.5" role="tablist">
            {(['month', 'week', 'program'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`min-h-[36px] rounded-full px-4 font-display text-xs font-semibold transition-colors ${
                  view === v ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'month' ? t('view_month') : v === 'week' ? t('view_week') : t('view_program')}
              </button>
            ))}
          </div>
        </div>

        {/* course filters */}
        {status === 'ready' && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5" aria-label={t('filter_label')}>
            <button
              onClick={resetCourses}
              className={`min-h-[32px] rounded-full border px-3 font-mono2 text-[0.65rem] uppercase tracking-wider transition-colors ${
                !touchedFilter
                  ? 'border-foreground/40 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('all_courses')}
            </button>
            {courses.map((ck) => {
              const on = activeCourses.has(ck);
              const c = courseColor(ck, courses);
              return (
                <button
                  key={ck}
                  onClick={() => toggleCourse(ck)}
                  aria-pressed={on}
                  className={`flex min-h-[32px] items-center gap-1.5 rounded-full border px-3 text-[0.72rem] font-medium transition-all ${
                    on ? 'course-chip' : 'border-border text-muted-foreground opacity-55 hover:opacity-90'
                  }`}
                  style={on ? { ['--c' as string]: c } : undefined}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                  {courseNames[ck]}
                </button>
              );
            })}
          </div>
        )}

        {/* body */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          {status === 'loading' && (
            <div className="flex h-72 flex-col items-center justify-center gap-3">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
              <span className="font-mono2 text-xs text-muted-foreground">{t('loading')}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="font-display font-semibold">{t('error_title')}</p>
              <p className="text-sm text-muted-foreground">{t('error_body')}</p>
              <button
                onClick={reload}
                className="mt-2 min-h-[40px] rounded-full bg-primary px-5 font-display text-xs font-semibold text-primary-foreground"
              >
                {t('retry')}
              </button>
            </div>
          )}

          {status === 'ready' && (
            <div key={view + cur} className="view-fade">
              {view === 'month' && <MonthView cursor={cur} eventsByDay={eventsByDay} colorOf={colorOf} />}
              {view === 'week' && <WeekView weekStart={weekStart} eventsByDay={eventsByDay} colorOf={colorOf} />}
              {view === 'program' && <ProgramView eventsByDay={eventsByDay} colorOf={colorOf} />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
