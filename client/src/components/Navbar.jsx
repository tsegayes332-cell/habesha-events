import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const navItems = [
  { labelKey: 'nav.home', to: '/' },
  { labelKey: 'nav.browse', to: '/browse' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { i18n, t } = useTranslation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLanguage = i18n.language?.startsWith('am') ? 'en' : 'am';
    i18n.changeLanguage(nextLanguage);
  };

  const shellClass = scrolled || !isHome
    ? 'bg-habesha-white/92 border-b border-imperial-green/10 shadow-imperial py-3'
    : 'bg-transparent py-5';

  const linkClass = (to) => {
    const active = location.pathname === to;
    return active
      ? 'text-imperial-green'
      : scrolled || !isHome
        ? 'text-charcoal/70 hover:text-imperial-green'
        : 'text-white/82 hover:text-white';
  };

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${shellClass}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-3">
            <div className="editorial-panel flex h-11 w-11 items-center justify-center rounded-2xl border-gold/20 bg-imperial-green text-gold transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
              {/* Ethiopian Cross as logo icon */}
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
                <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" stroke="#D4A843" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="leading-none">
              <div className={`text-xl md:text-2xl font-playfair font-black tracking-wide ${scrolled || !isHome ? 'text-imperial-green' : 'text-white'}`}>
                Habesha Events
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-3 editorial-panel px-3 py-2 rounded-full border-imperial-green/10 bg-white/75">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                    active ? 'bg-imperial-green text-white shadow-imperial' : 'text-charcoal/65 hover:bg-imperial-green/5 hover:text-imperial-green'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleLanguage}
              className={`editorial-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition-all ${
                scrolled || !isHome
                  ? 'bg-white/80 text-imperial-green'
                  : 'bg-white/12 text-white border-white/20'
              }`}
              title="Switch language"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language?.startsWith('am') ? 'EN' : 'AM'}</span>
            </button>

            <Link
              to="/submit"
              className="hidden md:inline-flex btn-gold rounded-full px-5 py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('nav.submit')}
            </Link>

            <button
              className={`lg:hidden rounded-full p-3 transition-colors ${
                scrolled || !isHome ? 'bg-imperial-green text-white' : 'bg-white/12 text-white'
              }`}
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden px-4 pb-4 pt-3">
          <div className="editorial-panel rounded-[28px] p-4 bg-white/95">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block rounded-2xl px-4 py-3 text-sm font-bold transition-all ${linkClass(item.to)} ${
                    location.pathname === item.to ? 'bg-imperial-green text-white' : 'bg-habesha-white'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
              <Link
                to="/submit"
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-gold px-4 py-3 text-sm font-bold text-white shadow-gold"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('nav.submit')}
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Tibeb stripe under navbar when scrolled */}
      {(scrolled || !isHome) && (
        <div className="overflow-hidden" aria-hidden="true">
          <svg width="100%" height="6" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tibeb-nav" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
                <polygon points="10,0 20,3 10,6 0,3" fill="none" stroke="#C8922A" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="6" fill="url(#tibeb-nav)" opacity="0.5" />
          </svg>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
