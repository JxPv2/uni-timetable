export interface CalEvent {
  uid: string;
  summary: string;
  course: string;      // display name, e.g. "Cost Accounting, Planning and Control"
  courseKey: string;   // normalized key for colors/filters
  professor: string;
  location: string;
  description: string;
  start: Date;
  end: Date;
}

/* ---------- ICS text helpers ---------- */

function unfold(text: string): string[] {
  const raw = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const out: string[] = [];
  for (const line of raw) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescapeText(s: string): string {
  return s
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/* ---------- Date parsing (UTC + Europe/Rome floating) ---------- */

function romeOffsetMs(y: number, mo: number, d: number, h: number, mi: number): number {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(guess));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return guess - asUTC; // offset of Rome relative to UTC at that moment
}

function parseICSDatetime(key: string, value: string): Date | null {
  // key may carry params, e.g. DTSTART;TZID=Europe/Rome
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!m) return null;
  const [, ys, mos, ds, hs, mis, ss, z] = m;
  const y = +ys, mo = +mos, d = +ds, h = +hs, mi = +mis, s = ss ? +ss : 0;
  if (z) return new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  if (/TZID=Europe\/Rome/i.test(key)) {
    const off = romeOffsetMs(y, mo, d, h, mi);
    return new Date(Date.UTC(y, mo - 1, d, h, mi, s) - off);
  }
  // Floating: interpret as UTC (best effort)
  return new Date(Date.UTC(y, mo - 1, d, h, mi, s));
}

/* ---------- Course naming ---------- */

const SMALL_WORDS = new Set(['and', 'of', 'the', 'in', 'for', 'di', 'e', 'del', 'della', 'dei', 'per', 'a', 'con']);

export function titleCase(s: string): string {
  return s
    .split(/(\s+)/) // keep separators
    .map((tok, i) => {
      if (/^\s*$/.test(tok)) return tok;
      const punct = tok.match(/^([^,;:]+)([,;:]?)$/);
      const word = punct ? punct[1] : tok;
      const tail = punct ? punct[2] : '';
      const lower = word.toLowerCase();
      if (SMALL_WORDS.has(lower) && i > 0) return lower + tail;
      // preserve short all-caps acronyms (EU, AI, IT…)
      if (word.length <= 3 && /[A-Z]/.test(word) && word === word.toUpperCase()) return word + tail;
      return lower.charAt(0).toUpperCase() + lower.slice(1) + tail;
    })
    .join('');
}

/* ---------- Parser ---------- */

export function parseICS(text: string): CalEvent[] {
  const lines = unfold(text);
  const events: CalEvent[] = [];
  let cur: { props: Record<string, string>; keys: Record<string, string> } | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      cur = { props: {}, keys: {} };
      continue;
    }
    if (line === 'END:VEVENT') {
      if (cur) {
        const p = cur.props;
        const start = p.DTSTART ? parseICSDatetime(cur.keys.DTSTART ?? 'DTSTART', p.DTSTART) : null;
        const end = p.DTEND ? parseICSDatetime(cur.keys.DTEND ?? 'DTEND', p.DTEND) : null;
        if (start && end && p.SUMMARY) {
          const summary = unescapeText(p.SUMMARY);
          const idx = summary.lastIndexOf(' - ');
          const rawCourse = idx > 0 ? summary.slice(0, idx) : summary;
          const professor = idx > 0 ? summary.slice(idx + 3) : '';
          events.push({
            uid: p.UID ?? `${p.DTSTART}-${summary}`,
            summary,
            course: titleCase(rawCourse),
            courseKey: rawCourse.trim().toUpperCase(),
            professor,
            location: p.LOCATION ? unescapeText(p.LOCATION) : '',
            description: p.DESCRIPTION ? unescapeText(p.DESCRIPTION) : '',
            start,
            end,
          });
        }
      }
      cur = null;
      continue;
    }
    if (cur) {
      const c = line.indexOf(':');
      if (c < 0) continue;
      const fullKey = line.slice(0, c);
      const base = fullKey.split(';')[0].toUpperCase();
      cur.props[base] = line.slice(c + 1);
      cur.keys[base] = fullKey;
    }
  }
  events.sort((a, b) => a.start.getTime() - b.start.getTime());
  return events;
}

/* ---------- Europe/Rome local-time helpers ---------- */

export interface RomeParts {
  y: number;
  m: number; // 1-12
  d: number;
  hh: number;
  mm: number;
  dow: number; // 0 = Monday ... 6 = Sunday
}

const romeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Rome',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'short',
});

const DOW_MAP: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export function romeParts(date: Date): RomeParts {
  const parts = romeFmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  let hh = Number(get('hour'));
  if (hh === 24) hh = 0;
  return {
    y: Number(get('year')),
    m: Number(get('month')),
    d: Number(get('day')),
    hh,
    mm: Number(get('minute')),
    dow: DOW_MAP[get('weekday')] ?? 0,
  };
}

export function dayKey(date: Date): string {
  const p = romeParts(date);
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}

/* Calendar-grid math uses UTC-noon dates so DST never interferes */
export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}
export function keyOf(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export function addDays(key: string, n: number): string {
  const dt = dateFromKey(key);
  dt.setUTCDate(dt.getUTCDate() + n);
  return keyOf(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}
export function mondayOf(key: string): string {
  const dt = dateFromKey(key);
  const dow = (dt.getUTCDay() + 6) % 7; // 0 = Monday
  dt.setUTCDate(dt.getUTCDate() - dow);
  return keyOf(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function todayKey(): string {
  return dayKey(new Date());
}

/* Course color assignment */
export const COURSE_PALETTE = ['#675BF4', '#5CE1E6', '#FF6B9D', '#7ED957', '#DFA54F', '#4F9DFF', '#B98CFF', '#FF8A5C'];

export function courseColor(courseKey: string, orderedKeys: string[]): string {
  const idx = orderedKeys.indexOf(courseKey);
  return COURSE_PALETTE[(idx >= 0 ? idx : 0) % COURSE_PALETTE.length];
}
