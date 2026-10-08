import { FEED_HTTPS } from '@/hooks/useEvents';
import { useLang } from '@/lib/i18n';

const UNI_TIMETABLE_URL =
  'https://economia.uniroma2.it/master-science/ba/dida/orariolezioni/1/';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <a
          href={UNI_TIMETABLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground underline decoration-transparent underline-offset-4 transition-colors hover:text-foreground hover:decoration-current"
          title={UNI_TIMETABLE_URL}
        >
          {t('footer_made')}
        </a>
        <a
          href={FEED_HTTPS}
          className="font-mono2 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          {t('footer_feed')}: calendar.ics
        </a>
      </div>
    </footer>
  );
}