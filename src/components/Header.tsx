import { useLang } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export default function Header() {
  const { lang, setLang, t } = useLang();
  const { theme, toggle } = useTheme();

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="font-mono2 label-caps !text-[0.75rem] text-foreground">
          UNI&nbsp;TIMETABLE
        </a>

        <nav className="hidden items-center gap-6 sm:flex">
          <a href="#subscribe" className="label-caps text-muted-foreground transition-colors hover:text-foreground">
            {t('nav_subscribe')}
          </a>
          <a href="#calendar" className="label-caps text-muted-foreground transition-colors hover:text-foreground">
            {t('nav_calendar')}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* Language switch */}
          <div className="flex overflow-hidden rounded-full border border-border" role="group" aria-label="Language">
            {(['en', 'it'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`min-h-[36px] px-3 font-mono2 text-[0.7rem] font-medium uppercase tracking-wider transition-colors ${
                  lang === l ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Theme switch */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
