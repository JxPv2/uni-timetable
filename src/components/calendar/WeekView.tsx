import { addDays, dateFromKey, todayKey, type CalEvent } from '@/lib/ics';
import { dateLocale, useLang } from '@/lib/i18n';
import { HOUR_END, HOUR_START, makeTimeFmt, romeMinutes } from './shared';

interface Props {
  weekStart: string; // Monday day-key
  eventsByDay: Map<string, CalEvent[]>;
  colorOf: (e: CalEvent) => string;
}

const SPAN_MIN = (HOUR_END - HOUR_START) * 60;

export default function WeekView({ weekStart, eventsByDay, colorOf }: Props) {
  const { lang, t } = useLang();
  const timeFmt = makeTimeFmt(dateLocale(lang));
  const dowFmt = new Intl.DateTimeFormat(dateLocale(lang), { weekday: 'short' });
  const today = todayKey();

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);

  return (
    <div className="week-scroll overflow-x-auto">
      <div className="min-w-[720px]">
        {/* day headers */}
        <div className="grid grid-cols-[3.2rem_repeat(7,1fr)] border-b border-border">
          <div />
          {days.map((k) => {
            const d = dateFromKey(k);
            const isToday = k === today;
            return (
              <div key={k} className="flex flex-col items-center gap-0.5 py-2">
                <span className="label-caps text-muted-foreground">{dowFmt.format(d)}</span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full font-mono2 text-xs ${
                    isToday ? 'bg-primary font-semibold text-primary-foreground' : ''
                  }`}
                >
                  {d.getUTCDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* time grid */}
        <div className="relative grid grid-cols-[3.2rem_repeat(7,1fr)]">
          {/* hour gutter */}
          <div className="relative">
            {hours.map((h) => (
              <div key={h} className="relative h-12">
                <span className="absolute -top-2 right-2 font-mono2 text-[0.65rem] text-muted-foreground">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* day columns */}
          {days.map((k) => {
            const evts = eventsByDay.get(k) ?? [];
            return (
              <div key={k} className="relative border-l border-border">
                {/* hour lines */}
                {hours.map((h) => (
                  <div key={h} className="h-12 border-b border-border/60" />
                ))}
                {/* event blocks */}
                {evts.map((e) => {
                  const startMin = Math.max(romeMinutes(e.start), HOUR_START * 60);
                  const endMin = Math.min(romeMinutes(e.end), HOUR_END * 60);
                  const top = ((startMin - HOUR_START * 60) / SPAN_MIN) * 100;
                  const height = Math.max(((endMin - startMin) / SPAN_MIN) * 100, 4);
                  return (
                    <div
                      key={e.uid}
                      title={`${timeFmt.format(e.start)}–${timeFmt.format(e.end)} ${e.course}${e.location ? ` · ${e.location}` : ''}`}
                      className="course-block absolute inset-x-1 overflow-hidden rounded-md px-1.5 py-1"
                      style={{ top: `${top}%`, height: `${height}%`, ['--c' as string]: colorOf(e) }}
                    >
                      <div className="truncate font-mono2 text-[0.6rem] opacity-75">
                        {timeFmt.format(e.start)}–{timeFmt.format(e.end)}
                      </div>
                      <div className="truncate text-[0.68rem] font-semibold leading-tight">{e.course}</div>
                      {e.location && (
                        <div className="truncate text-[0.62rem] opacity-75">{e.location}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {days.every((k) => !(eventsByDay.get(k)?.length)) && (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('no_events')}</p>
        )}
      </div>
    </div>
  );
}
