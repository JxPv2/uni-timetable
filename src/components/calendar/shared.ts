import { dayKey, romeParts, type CalEvent } from '@/lib/ics';

export const HOUR_START = 7; // Rome local
export const HOUR_END = 21;

export function groupByDay(events: CalEvent[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  for (const e of events) {
    const k = dayKey(e.start);
    const arr = map.get(k);
    if (arr) arr.push(e);
    else map.set(k, [e]);
  }
  return map;
}

export function makeTimeFmt(locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

export function timeRange(e: CalEvent, fmt: Intl.DateTimeFormat): string {
  return `${fmt.format(e.start)}–${fmt.format(e.end)}`;
}

/** minutes since midnight, Rome local */
export function romeMinutes(date: Date): number {
  const p = romeParts(date);
  return p.hh * 60 + p.mm;
}
