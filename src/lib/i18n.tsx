import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'it';

const dict = {
  en: {
    nav_subscribe: 'Subscribe',
    nav_calendar: 'Calendar',
    hero_kicker: 'Tor Vergata · Business Administration',
    hero_title_1: 'Your semester,',
    hero_title_2: 'always in sync.',
    hero_sub:
      'One link, every lecture. Subscribe once and the timetable updates itself in your calendar app — new classes, room changes, everything.',
    hero_cta_subscribe: 'Subscribe now',
    hero_cta_browse: 'Browse the timetable',
    next_up: 'Next up',
    stats_lectures: 'lectures',
    stats_courses: 'courses',
    stats_updates: 'auto-updating feed',

    sub_kicker: 'Add to your calendar',
    sub_title: 'Subscribe once. Never copy a timetable again.',
    sub_sub: 'Pick your app below. The feed refreshes automatically whenever the university timetable changes.',
    apple_title: 'Apple Calendar',
    apple_note: 'iPhone, iPad or Mac — tap and confirm the subscription.',
    apple_cta: 'Subscribe in Apple Calendar',
    google_title: 'Google Calendar',
    google_note: 'Opens Google Calendar with the feed pre-filled. On desktop only.',
    google_cta: 'Add to Google Calendar',
    google_fallback: 'Doesn’t work? Use “Add by URL” in Google Calendar settings and paste the feed link.',
    outlook_title: 'Outlook',
    outlook_note: 'Opens Outlook on the web with the subscription dialog.',
    outlook_cta: 'Add to Outlook',
    universal_title: 'Any other calendar app',
    universal_note: 'Copy the feed URL and paste it into your app’s “subscribe from web / add by URL” option, or download the file for a one-off import (no auto-updates).',
    universal_copy: 'Copy feed URL',
    universal_copied: 'Copied!',
    universal_download: 'Download .ics file',

    cal_kicker: 'Live timetable',
    cal_title: 'Browse the calendar',
    cal_sub: 'The same feed your calendar app receives — rendered right here.',
    view_month: 'Month',
    view_week: 'Week',
    view_program: 'Program',
    today: 'Today',
    all_courses: 'All courses',
    filter_label: 'Filter courses',
    loading: 'Loading timetable…',
    error_title: 'Couldn’t load the timetable',
    error_body: 'Check your connection and try again.',
    retry: 'Retry',
    no_events: 'No lectures in this period',
    more: 'more',
    lecture: 'Lecture',
    show_more_days: 'Show more days',
    showing_days: 'days shown',
    feed_source_live: 'Live feed',
    feed_source_snapshot: 'Cached snapshot',

    footer_made: 'Auto-updating feed from the Tor Vergata Business Administration timetable.',
    footer_feed: 'Feed',
  },
  it: {
    nav_subscribe: 'Iscriviti',
    nav_calendar: 'Calendario',
    hero_kicker: 'Tor Vergata · Business Administration',
    hero_title_1: 'Il tuo semestre,',
    hero_title_2: 'sempre sincronizzato.',
    hero_sub:
      'Un link, tutte le lezioni. Iscriviti una sola volta e l’orario si aggiorna da solo nella tua app calendario — nuove lezioni, cambi d’aula, tutto.',
    hero_cta_subscribe: 'Iscriviti ora',
    hero_cta_browse: 'Sfoglia l’orario',
    next_up: 'Prossima lezione',
    stats_lectures: 'lezioni',
    stats_courses: 'corsi',
    stats_updates: 'feed auto-aggiornato',

    sub_kicker: 'Aggiungi al calendario',
    sub_title: 'Iscriviti una volta. Non copiare più l’orario.',
    sub_sub: 'Scegli la tua app qui sotto. Il feed si aggiorna automaticamente a ogni cambio di orario dell’università.',
    apple_title: 'Apple Calendar',
    apple_note: 'iPhone, iPad o Mac — tocca e conferma l’iscrizione.',
    apple_cta: 'Iscriviti con Apple Calendar',
    google_title: 'Google Calendar',
    google_note: 'Apre Google Calendar con il feed già compilato. Solo da desktop.',
    google_cta: 'Aggiungi a Google Calendar',
    google_fallback: 'Non funziona? Usa “Aggiungi tramite URL” nelle impostazioni di Google Calendar e incolla il link del feed.',
    outlook_title: 'Outlook',
    outlook_note: 'Apre Outlook sul web con la finestra di iscrizione.',
    outlook_cta: 'Aggiungi a Outlook',
    universal_title: 'Qualsiasi altra app calendario',
    universal_note: 'Copia l’URL del feed e incollalo nell’opzione “iscriviti da web / aggiungi tramite URL” della tua app, oppure scarica il file per un’importazione una tantum (senza aggiornamenti automatici).',
    universal_copy: 'Copia URL del feed',
    universal_copied: 'Copiato!',
    universal_download: 'Scarica il file .ics',

    cal_kicker: 'Orario in diretta',
    cal_title: 'Sfoglia il calendario',
    cal_sub: 'Lo stesso feed che riceve la tua app calendario — visualizzato qui.',
    view_month: 'Mese',
    view_week: 'Settimana',
    view_program: 'Programma',
    today: 'Oggi',
    all_courses: 'Tutti i corsi',
    filter_label: 'Filtra corsi',
    loading: 'Caricamento orario…',
    error_title: 'Impossibile caricare l’orario',
    error_body: 'Controlla la connessione e riprova.',
    retry: 'Riprova',
    no_events: 'Nessuna lezione in questo periodo',
    more: 'altre',
    lecture: 'Lezione',
    show_more_days: 'Mostra più giorni',
    showing_days: 'giorni mostrati',
    feed_source_live: 'Feed live',
    feed_source_snapshot: 'Copia cache',

    footer_made: 'Feed auto-aggiornato dall’orario di Business Administration, Tor Vergata.',
    footer_feed: 'Feed',
  },
} as const;

export type TKey = keyof (typeof dict)['en'];

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('ut-lang');
      if (saved === 'en' || saved === 'it') return saved;
    } catch {}
    return navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('ut-lang', l);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (k: TKey) => dict[lang][k] ?? k;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

export function dateLocale(lang: Lang): string {
  return lang === 'it' ? 'it-IT' : 'en-GB';
}
