import { dateFromKey, keyOf, todayKey, type CalEvent } from '@/lib/ics';
import { dateLocale, useLang } from '@/lib/i18n';
import { makeTimeFmt } from './shared';

interface Props {
  cursor: string; // any day key inside the displayed month
  eventsByDay: Map<string, CalEvent[]>;
  colorOf: (e: CalEvent) => string;
}

export default function MonthView({ cursor, eventsByDay, colorOf }: Props) {
  const { lang } = useLang();
  const cur = dateFromKey(cursor);
  const y = cur.getUTCFullYear();
  const m = cur.getUTCMonth();
  const firstDow = (new Date(Date.UTC(y, m, 1, 12)).getUTCDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0, 12)).getUTCDate();

  const cells: { key: string; day: number | null }[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ key: `pre-${i}`, day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ key: keyOf(y, m + 1, d), day: d });
  while (cells.length % 7 !== 0) cells.push({ key: `post-${cells.length}`, day: null });

  const today = todayKey();
  const timeFmt = makeTimeFmt(dateLocale(lang));
  const dowFmt = new Intl.DateTimeFormat(dateLocale(lang), { weekday: 'short' });
  const mondayRef = new Date(Date.UTC(2026, 0, 5, 12)); // a Monday

  return (
    <div>
      {/* weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="label-caps py-2 text-center text-muted-foreground">
            {dowFmt.format(addDaysRef(mondayRef, i))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const dayEvents = cell.day ? (eventsByDay.get(cell.key) ?? []) : [];
          const isToday = cell.key === today;
          return (
            <div
              key={cell.key}
              className={`min-h-[64px] border-b border-border p-1 sm:min-h-[104px] sm:p-1.5 ${
                i % 7 !== 6 ? 'border-r' : ''
              } ${cell.day ? 'bg-card' : 'bg-secondary/30'}`}
            >
              {cell.day && (
                <>
                  <div
                    className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full font-mono2 text-[0.7rem] ${
                      isToday ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {cell.day}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.uid}
                        title={`${timeFmt.format(e.start)} ${e.course}${e.location ? ` · ${e.location}` : ''}`}
                        className="course-chip hidden items-center gap-1 truncate rounded px-1 py-0.5 text-[0.62rem] leading-tight sm:flex"
                        style={{ ['--c' as string]: colorOf(e) }}
                      >
                        <span className="font-mono2 opacity-70">{timeFmt.format(e.start)}</span>
                        <span className="truncate">{e.course}</span>
                      </div>
                    ))}
                    {/* mobile: dots only */}
                    <div className="flex flex-wrap gap-1 sm:hidden">
                      {dayEvents.slice(0, 4).map((e) => (
                        <span
                          key={e.uid}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: colorOf(e) }}
                        />
                      ))}
                    </div>
                    {dayEvents.length > 3 && (
                      <div className="hidden px-1 font-mono2 text-[0.62rem] text-muted-foreground sm:block">
                        +{dayEvents.length - 3} {/* more */}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function addDaysRef(d: Date, n: number): Date {
  const c = new Date(d.getTime());
  c.setUTCDate(c.getUTCDate() + n);
  return c;
}
