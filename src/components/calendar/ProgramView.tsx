import { useMemo, useState } from 'react';
import { dateFromKey, todayKey, type CalEvent } from '@/lib/ics';
import { dateLocale, useLang } from '@/lib/i18n';
import { makeTimeFmt, timeRange } from './shared';

interface Props {
  eventsByDay: Map<string, CalEvent[]>;
  colorOf: (e: CalEvent) => string;
}

const CHUNK = 14; // days per page

export default function ProgramView({ eventsByDay, colorOf }: Props) {
  const { lang, t } = useLang();
  const timeFmt = makeTimeFmt(dateLocale(lang));
  const dayFmt = new Intl.DateTimeFormat(dateLocale(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const today = todayKey();

  const allKeys = useMemo(() => [...eventsByDay.keys()].sort(), [eventsByDay]);

  // start paging at the first day >= today (fall back to first day overall)
  const startIdx = useMemo(() => {
    const i = allKeys.findIndex((k) => k >= today);
    return i >= 0 ? i : 0;
  }, [allKeys, today]);

  const [pages, setPages] = useState(1);
  const visible = allKeys.slice(startIdx, startIdx + pages * CHUNK);
  const remaining = allKeys.length - (startIdx + pages * CHUNK);

  if (allKeys.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t('no_events')}</p>;
  }

  return (
    <div className="px-1 py-2 sm:px-2">
      {visible.map((k) => {
        const evts = eventsByDay.get(k) ?? [];
        const isToday = k === today;
        return (
          <div key={k} className="mb-6">
            <div className="flex items-baseline gap-3">
              <h3
                className={`font-display text-sm font-semibold capitalize ${
                  isToday ? 'text-primary' : 'text-foreground'
                }`}
              >
                {dayFmt.format(dateFromKey(k))}
              </h3>
              {isToday && <span className="label-caps text-primary">{t('today')}</span>}
            </div>

            <div className="mt-2 border-l border-border">
              {evts.map((e) => (
                <div key={e.uid} className="relative flex gap-3 py-2 pl-4 sm:gap-5 sm:pl-6">
                  <span
                    className="absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-card"
                    style={{ background: colorOf(e) }}
                  />
                  <span className="w-[5.2rem] shrink-0 pt-0.5 font-mono2 text-[0.7rem] text-muted-foreground sm:w-24 sm:text-xs">
                    {timeRange(e, timeFmt)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm font-semibold leading-snug">{e.course}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[e.professor, e.location].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {remaining > 0 && (
        <button
          onClick={() => setPages((p) => p + 1)}
          className="mb-4 w-full rounded-full border border-foreground/20 py-3 font-display text-sm font-semibold transition-colors hover:border-foreground/50"
        >
          {t('show_more_days')} · {Math.min(remaining, CHUNK)}+
        </button>
      )}
    </div>
  );
}
