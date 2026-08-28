import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative overflow-hidden bg-[#0A0A0A] text-white">

      {/* Tibeb stripe */}
      <div className="w-full overflow-hidden" aria-hidden="true">
        <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tibeb-f" x="0" y="0" width="16" height="12" patternUnits="userSpaceOnUse">
              <polygon points="8,0 16,6 8,12 0,6" fill="none" stroke="#D4A843" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="12" fill="url(#tibeb-f)" />
        </svg>
      </div>

      {/* Ethiopian flag bar */}
      <div className="flex h-[3px] w-full" aria-hidden="true">
        <div className="flex-1 bg-[#078930]" />
        <div className="flex-1 bg-[#FCDD09]" />
        <div className="flex-1 bg-[#DA121A]" />
      </div>

      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/15 border border-gold/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" stroke="#D4A843" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-playfair font-black tracking-wide text-white">Habesha Events</span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { label: t('footer.link_home'), to: '/' },
              { label: t('footer.link_browse'), to: '/browse' },
              { label: t('footer.link_submit'), to: '/submit' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 shrink-0">
            {t('footer.energy')} &nbsp;|&nbsp; © 2026 Habesha Events
          </p>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
