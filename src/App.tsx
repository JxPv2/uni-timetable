import Header from '@/components/Header';
import CalendarSection from '@/components/calendar/CalendarSection';
import { EventsProvider } from '@/hooks/useEvents';
import { LangProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import Footer from '@/sections/Footer';
import Hero from '@/sections/Hero';
import Subscribe from '@/sections/Subscribe';

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <EventsProvider>
          <Header />
          <main>
            <Hero />
            <Subscribe />
            <CalendarSection />
          </main>
          <Footer />
        </EventsProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
