import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { parseICS, type CalEvent } from '@/lib/ics';

export const FEED_HTTPS = 'https://jxpv2.github.io/uni-timetable/calendar.ics';
export const FEED_WEBCAL = 'webcal://jxpv2.github.io/uni-timetable/calendar.ics';
export const GOOGLE_SUB = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(FEED_WEBCAL)}`;
export const OUTLOOK_SUB = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(FEED_HTTPS)}&name=${encodeURIComponent('Uni Timetable')}`;
export const GOOGLE_SETTINGS = 'https://calendar.google.com/calendar/u/0/r/settings/addbyurl';

type Status = 'loading' | 'ready' | 'error';

interface EventsCtx {
  events: CalEvent[];
  status: Status;
  source: 'live' | 'snapshot' | null;
  reload: () => void;
  courses: string[]; // ordered courseKeys
  courseNames: Record<string, string>;
}

const Ctx = createContext<EventsCtx>({
  events: [],
  status: 'loading',
  source: null,
  reload: () => {},
  courses: [],
  courseNames: {},
});

async function fetchFeed(): Promise<{ events: CalEvent[]; source: 'live' | 'snapshot' }> {
  // 1) Same-origin feed (when hosted on GitHub Pages alongside calendar.ics)
  // 2) Absolute feed URL (works cross-origin: GitHub Pages sends ACAO:*)
  // 3) Bundled snapshot as last resort
  const candidates: { url: string; source: 'live' | 'snapshot' }[] = [
    { url: './calendar.ics', source: 'live' },
    { url: FEED_HTTPS, source: 'live' },
    { url: './calendar-snapshot.ics', source: 'snapshot' },
  ];
  let lastErr: unknown = null;
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const events = parseICS(text);
      if (events.length === 0) throw new Error('Empty feed');
      return { events, source: c.source };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('All feed sources failed');
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [source, setSource] = useState<'live' | 'snapshot' | null>(null);

  const load = useCallback(() => {
    setStatus('loading');
    fetchFeed()
      .then(({ events, source }) => {
        setEvents(events);
        setSource(source);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { courses, courseNames } = useMemo(() => {
    const names: Record<string, string> = {};
    for (const e of events) {
      if (!names[e.courseKey]) names[e.courseKey] = e.course;
    }
    return { courses: Object.keys(names).sort((a, b) => names[a].localeCompare(names[b])), courseNames: names };
  }, [events]);

  return (
    <Ctx.Provider value={{ events, status, source, reload: load, courses, courseNames }}>
      {children}
    </Ctx.Provider>
  );
}

export function useEvents() {
  return useContext(Ctx);
}
