import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Music,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { getEthiopianDate } from '../utils/ethiopianCalendar';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// ── Ethiopian Cultural Design Elements ────────────────────────────────────
const TibebDivider = ({ id = 'tibeb' }) => (
  <div className="w-full overflow-hidden" aria-hidden="true">
    <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width="20" height="12" patternUnits="userSpaceOnUse">
          <polygon points="10,0 20,6 10,12 0,6" fill="none" stroke="#C8922A" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill={`url(#${id})`} />
    </svg>
  </div>
);

const EthiopianCross = ({ className = 'w-5 h-5 inline-block' }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" stroke="#C8922A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AxumObelisk = ({ className = '' }) => (
  <svg width="60" height="160" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <polygon points="30,0 38,20 35,20 35,140 40,145 40,160 20,160 20,145 25,140 25,20 22,20" fill="#C8922A" opacity="0.28" />
    <rect x="20" y="60" width="20" height="3" fill="#C8922A" opacity="0.28" />
    <rect x="20" y="90" width="20" height="3" fill="#C8922A" opacity="0.28" />
    <rect x="20" y="120" width="20" height="3" fill="#C8922A" opacity="0.28" />
  </svg>
);

const wovenStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8922A' fill-opacity='0.06'%3E%3Cpath d='M0 0h10v10H0zm10 10h10v10H10z'/%3E%3C/g%3E%3C/svg%3E")`,
};
// ──────────────────────────────────────────────────────────────────────────



const categoryRail = [
  'Music sets',
  'Food rituals',
  'Fashion scenes',
  'Festival nights',
  'Coffee culture',
  'Creative diaspora',
  'Tech after-dark',
  'Live performances',
];

const useCounter = (target, duration = 2000, inView = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;

    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
        return;
      }
      setCount(Math.floor(current));
    }, 16);

    return () => clearInterval(timer);
  }, [duration, inView, target]);

  return count;
};

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? (doc.scrollTop / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

const Home = () => {
  const revealRefs = useRef([]);
  const statsRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  const ethDate = getEthiopianDate();
  const { t } = useTranslation();

  // ── Live API events ───────────────────────────────────────────────
  const [liveEvents, setLiveEvents] = useState([]);
  const [, setEventsLoading] = useState(true);
  const [stats, setStats] = useState({ events: 0, cities: 0, categories: 0, free: 0 });

  useEffect(() => {
    axios
      .get(`${(import.meta.env.VITE_API_URL || '')}/api/events`)
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        setLiveEvents(all.slice(0, 4));
        setStats({
          events: all.length,
          cities: new Set(all.map((e) => e.city)).size,
          categories: new Set(all.map((e) => e.category)).size,
          free: all.filter((e) => e.is_free).length,
        });
      })
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setEventsLoading(false));
  }, []);
  // ─────────────────────────────────────────────────────────────────

  const eventsCount = useCounter(stats.events, 2000, statsInView);
  const citiesCount = useCounter(stats.cities, 2000, statsInView);
  const categoriesCount = useCounter(stats.categories, 2000, statsInView);
  const freeCount = useCounter(stats.free, 2000, statsInView);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.12 }
    );

    revealRefs.current.forEach((element) => {
      if (element) {
        revealObserver.observe(element);
      }
    });

    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!statsRef.current) return undefined;

    const statsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
        }
      },
      { threshold: 0.35 }
    );

    statsObserver.observe(statsRef.current);
    return () => statsObserver.disconnect();
  }, []);

  const addToRefs = (element) => {
    if (element && !revealRefs.current.includes(element)) {
      revealRefs.current.push(element);
    }
  };

  return (
    <div className="overflow-hidden">
      <ScrollProgress />
      <Helmet>
        <title>Habesha Events - Loud energy, clean discovery</title>
      </Helmet>

      <section className="relative overflow-hidden bg-charcoal pb-16 pt-32 md:pt-40" style={wovenStyle}>
        <div className="aurora-blob left-[-6%] top-[-12%] h-[420px] w-[420px] bg-gold/25" />
        <div className="aurora-blob right-[-8%] top-1/4 h-[380px] w-[380px] bg-patriot-red/20" style={{ animationDelay: '-6s' }} />
        <div className="aurora-blob bottom-[-22%] left-1/3 h-[360px] w-[360px] bg-imperial-green/40" style={{ animationDelay: '-11s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,168,67,0.22),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_18%)]" />
        <div className="absolute inset-0 bg-cross-pattern opacity-[0.04]" />
        {/* Axum Obelisk — decorative silhouette */}
        <AxumObelisk className="absolute right-8 bottom-0 hidden xl:block" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-7 reveal" ref={addToRefs}>
              <div className="max-w-4xl">
                <h1 className="animate-fade-up text-5xl font-playfair font-black leading-[0.92] text-white md:text-7xl xl:text-[6.4rem]" style={{ animationDelay: '0.05s' }}>
                  {t('hero.heading_1')}
                  <span className="block text-gold italic text-shimmer-gold">{t('hero.heading_2')}</span>
                </h1>
                <p className="animate-fade-up mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg" style={{ animationDelay: '0.2s' }}>
                  {t('hero.subtitle_v2')}
                </p>
              </div>

              <div className="animate-fade-up flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '0.35s' }}>
                <Link to="/browse" className="btn-gold btn-shine rounded-full px-7 py-4 text-sm">
                  {t('hero.explore_btn')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link to="/submit" className="btn-outline-gold btn-shine rounded-full px-7 py-4 text-sm border-white/20 bg-white/10 text-white hover:border-gold hover:bg-gold">
                  {t('hero.submit_big_btn')}
                </Link>
              </div>

              <div className="animate-fade-up flex flex-wrap gap-3 pt-2" style={{ animationDelay: '0.5s' }}>
                {[
                  ['Music', t('hero.chip_music')],
                  ['Food', t('hero.chip_food')],
                  ['Culture', t('hero.chip_culture')],
                  ['Fashion', t('hero.chip_fashion')],
                  ['Live sets', t('hero.chip_live')],
                ].map(([key, label], idx) => (
                  <span key={key} className="floating-chip float-slow text-white/88" style={{ animationDelay: `${idx * 0.7}s` }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="animate-fade-up reveal" ref={addToRefs} style={{ animationDelay: '0.65s' }}>
              <div className="editorial-panel editorial-glow hover-lift relative overflow-hidden rounded-[34px] border-white/10 bg-white/9 p-4 backdrop-blur-md">
                <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[28px] bg-white/10 p-5 text-white">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-gold">
                      {t('hero.cal_label')}
                    </div>
                    <div className="mt-4 text-6xl font-playfair font-black">{ethDate.day}</div>
                    <div className="mt-1 text-lg font-semibold text-white/85">{ethDate.month}</div>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/72">
                      <CalendarDays className="w-3.5 h-3.5 text-gold" />
                      <span>{ethDate.year} {t('hero.cal_vibe')}</span>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[28px] min-h-[380px]">
                    {liveEvents && liveEvents.length > 0 ? (
                      <img
                        src={liveEvents[0].image_url}
                        alt="Featured Event"
                        className="kenburns h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gold/20 to-imperial-green/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-imperial-green">
                        <Music className="w-3.5 h-3.5 text-patriot-red" />
                        <span>{t('hero.spotlight')}</span>
                      </div>
                      <h2 className="max-w-sm text-3xl font-playfair font-black leading-tight text-white">
                        {liveEvents[0]?.title || t('hero.spotlight')}
                      </h2>
                      {liveEvents[0]?.city && (
                        <p className="flex items-center gap-2 text-sm text-white/85">
                          <MapPin className="w-4 h-4 text-gold" />
                          {liveEvents[0].city}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TibebDivider id="tibeb-hero" />
      {/* Cultural Greeting Banner with Ethiopian aesthetic */}
      <div className="relative overflow-hidden bg-imperial-green py-14">
        <div className="absolute inset-0 ethiopian-cross opacity-[0.08]" />
        <div className="absolute inset-0 stripe-band top-0 left-0 right-0 h-1" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">{t('hero.greeting_kicker')}</p>
            <h3 className="text-3xl md:text-4xl font-playfair font-black text-white">
              {t('hero.greeting_title')}
            </h3>
            <p className="max-w-2xl mx-auto text-amber-100 font-medium italic">
              {t('hero.greeting_sub')}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 stripe-band bottom-0 left-0 right-0 h-1" />
      </div>
      {/* ── NEW TIBEB DIVIDER SECTION ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-amber-50 py-8">
        {/* 1. TOP TIBEB BORDER */}
        <div className="absolute top-0 left-0 w-full h-[14px] overflow-hidden" aria-hidden="true">
          <svg width="100%" height="14">
            <defs>
              <pattern id="top-tibeb-diamond" x="0" y="0" width="28" height="14" patternUnits="userSpaceOnUse">
                <polygon points="14,1 27,7 14,13 1,7" fill="none" stroke="#C8922A" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="14" fill="url(#top-tibeb-diamond)" />
          </svg>
        </div>

        {/* 2. FADED GE'EZ WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none" aria-hidden="true">
          <span className="text-[7rem] opacity-5 text-amber-800 font-bold">ሀ</span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-6">
          {/* 3. BILINGUAL TAGLINE */}
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="opacity-60 animate-pulse shrink-0">
              <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" stroke="#8B1A1A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <h2 className="font-playfair text-lg md:text-2xl tracking-[0.15em] uppercase text-amber-900 font-semibold leading-tight">
              {t('home.tibeb_tagline')}
            </h2>

            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="opacity-60 animate-pulse shrink-0">
              <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" stroke="#8B1A1A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* 4. INFINITE SCROLLING TIBEB MARQUEE */}
          <div className="overflow-hidden w-full py-2">
            <div className="flex animate-marquee w-max gap-6">
              {[...Array(40)].map((_, i) => (
                <svg key={i} width="40" height="20" viewBox="0 0 40 20" className="shrink-0">
                  <polygon points="20,2 38,10 20,18 2,10" fill="none" stroke="#C8922A" strokeWidth="1.5" />
                  <circle cx="20" cy="10" r="2" fill="#8B1A1A" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* 5. BOTTOM TIBEB BORDER */}
        <div className="absolute bottom-0 left-0 w-full h-[14px] overflow-hidden" aria-hidden="true">
          <svg width="100%" height="14">
            <defs>
              <pattern id="bottom-tibeb-diamond" x="0" y="0" width="28" height="14" patternUnits="userSpaceOnUse">
                <polygon points="14,1 27,7 14,13 1,7" fill="none" stroke="#2D5016" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="14" fill="url(#bottom-tibeb-diamond)" />
          </svg>
        </div>
      </section>
      {/* ────────────────────────────────────────────────────────────────────────── */}


      <div className="marquee-shell border-y border-imperial-green/10 bg-habesha-white py-4">
        <div className="marquee-track gap-3">
          {[...categoryRail, ...categoryRail].map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="inline-flex items-center gap-3 rounded-full border border-imperial-green/10 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-imperial-green shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>






      <TibebDivider id="tibeb-stats" />
      <section ref={statsRef} className="py-18 bg-charcoal injera-texture">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="editorial-panel rounded-[34px] border-white/8 bg-white/8 p-8 md:p-10">
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { icon: Ticket, label: t('home.stat_events'), value: `${eventsCount}+` },
                { icon: MapPin, label: t('home.stat_cities'), value: `${citiesCount}+` },
                { icon: Sparkles, label: t('home.stat_categories'), value: `${categoriesCount}+` },
                { icon: Users, label: t('home.stat_free'), value: `${freeCount}+` },
              ].map((item, index) => (
                <div key={item.label} className="reveal rounded-[24px] border border-white/10 bg-white/6 p-6 text-white" ref={addToRefs} style={{ transitionDelay: `${index * 0.06}s` }}>
                  <item.icon className="w-6 h-6 text-gold" />
                  <div className="mt-5 text-4xl font-playfair font-black">{item.value}</div>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/50">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TibebDivider id="tibeb-cta" />
      {liveEvents.length > 1 && (
        <section className="overflow-hidden bg-habesha-white pb-16 pt-14">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mb-10">
            <div className="flex items-end justify-between gap-6">
              <div className="reveal" ref={addToRefs}>
                <div className="section-kicker">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('home.events_kicker')}
                </div>
                <h2 className="mt-4 text-3xl md:text-5xl font-playfair font-black tracking-wide text-charcoal">
                  {t('home.events_heading')}
                </h2>
              </div>
              <Link to="/browse" className="btn-outline-gold rounded-full px-6 py-3 hidden md:inline-flex">
                {t('home.explore_all')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="marquee-shell">
            <div className="marquee-track gap-5 pr-5">
              {[...liveEvents, ...liveEvents].map((ev, idx) => (
                <Link
                  key={`${ev.id}-${idx}`}
                  to={`/events/${ev.id}`}
                  className="marquee-card group relative block w-[300px] h-[220px] shrink-0 overflow-hidden rounded-[24px]"
                >
                  <img
                    src={ev.image_url}
                    alt={ev.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">{ev.category}</div>
                    <h3 className="mt-1 text-lg font-playfair font-black leading-tight text-white">{ev.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
                      <MapPin className="w-3.5 h-3.5" />
                      {ev.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="reveal" ref={addToRefs}>
              <div className="editorial-panel rounded-[34px] p-8 md:p-10 mesob-weave">
                <div className="relative">
                  <span className="absolute text-[8rem] font-bold opacity-5 select-none pointer-events-none text-amber-800 -z-10 top-0 left-0" aria-hidden="true">ለ</span>
                  <div className="section-kicker">
                    <EthiopianCross className="w-3.5 h-3.5 mr-1" />
                    {t('home.organizer_kicker')}
                  </div>
                  <h2 className="mt-5 text-4xl font-playfair font-black tracking-wide text-imperial-green md:text-5xl">
                    {t('home.organizer_heading')}
                  </h2>
                </div>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/62">
                  {t('home.organizer_sub')}
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link to="/submit" className="btn-primary rounded-full px-7 py-4">
                    {t('home.submit_event')}
                  </Link>
                  <Link to="/browse" className="btn-outline-gold rounded-full px-7 py-4">
                    {t('home.see_standard')}
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 reveal" ref={addToRefs}>
              {[
                { title: t('home.step1_title_v2'), body: t('home.step1_body') },
                { title: t('home.step2_title_v2'), body: t('home.step2_body') },
                { title: t('home.step3_title_v2'), body: t('home.step3_body') },
              ].map((item, index) => (
                <div key={item.title} className="editorial-panel rounded-[28px] p-6 tilt-card" style={{ transitionDelay: `${index * 0.08}s` }}>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-patriot-red">Step 0{index + 1}</div>
                  <h3 className="mt-4 text-2xl font-playfair font-black text-charcoal">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/58">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <TibebDivider id="tibeb-newsletter" />
      <section className="py-24 bg-imperial-green relative overflow-hidden">
        {/* SCATTERED GE'EZ BACKGROUND */}
        <div className="absolute inset-0 select-none pointer-events-none overflow-hidden" aria-hidden="true">
          {[
            { c: 'ሀ', t: '5%', l: '8%', s: 'text-4xl', o: 'opacity-10', r: 'rotate-12', cl: 'text-amber-300' },
            { c: 'ለ', t: '12%', l: '85%', s: 'text-6xl', o: 'opacity-5', r: '-rotate-6', cl: 'text-green-200' },
            { c: 'መ', t: '25%', l: '15%', s: 'text-2xl', o: 'opacity-15', r: 'rotate-45', cl: 'text-amber-300' },
            { c: 'ረ', t: '40%', l: '5%', s: 'text-5xl', o: 'opacity-8', r: '-rotate-12', cl: 'text-green-200' },
            { c: 'ሰ', t: '60%', l: '10%', s: 'text-3xl', o: 'opacity-12', r: 'rotate-3', cl: 'text-amber-300' },
            { c: 'ቀ', t: '15%', l: '40%', s: 'text-4xl', o: 'opacity-5', r: 'rotate-12', cl: 'text-green-200' },
            { c: 'በ', t: '80%', l: '12%', s: 'text-6xl', o: 'opacity-10', r: '-rotate-6', cl: 'text-amber-300' },
            { c: 'ተ', t: '85%', l: '45%', s: 'text-2xl', o: 'opacity-15', r: 'rotate-45', cl: 'text-green-200' },
            { c: 'ነ', t: '50%', l: '90%', s: 'text-5xl', o: 'opacity-8', r: '-rotate-12', cl: 'text-amber-300' },
            { c: 'አ', t: '30%', l: '80%', s: 'text-3xl', o: 'opacity-12', r: 'rotate-3', cl: 'text-green-200' },
            { c: 'ከ', t: '70%', l: '75%', s: 'text-4xl', o: 'opacity-10', r: 'rotate-12', cl: 'text-amber-300' },
            { c: 'ወ', t: '10%', l: '25%', s: 'text-6xl', o: 'opacity-5', r: '-rotate-6', cl: 'text-green-200' },
            { c: 'ዘ', t: '45%', l: '35%', s: 'text-2xl', o: 'opacity-15', r: 'rotate-45', cl: 'text-amber-300' },
            { c: 'የ', t: '5%', l: '60%', s: 'text-5xl', o: 'opacity-8', r: '-rotate-12', cl: 'text-green-200' },
            { c: 'ደ', t: '90%', l: '25%', s: 'text-3xl', o: 'opacity-12', r: 'rotate-3', cl: 'text-amber-300' },
            { c: 'ጀ', t: '20%', l: '70%', s: 'text-4xl', o: 'opacity-10', r: 'rotate-12', cl: 'text-green-200' },
            { c: 'ጠ', t: '55%', l: '65%', s: 'text-6xl', o: 'opacity-5', r: '-rotate-6', cl: 'text-amber-300' },
            { c: 'ፀ', t: '35%', l: '50%', s: 'text-2xl', o: 'opacity-15', r: 'rotate-45', cl: 'text-green-200' },
            { c: 'ፈ', t: '75%', l: '30%', s: 'text-5xl', o: 'opacity-8', r: '-rotate-12', cl: 'text-amber-300' },
            { c: 'ሒ', t: '15%', l: '95%', s: 'text-3xl', o: 'opacity-12', r: 'rotate-3', cl: 'text-green-200' },
            { c: 'ሙ', t: '65%', l: '55%', s: 'text-4xl', o: 'opacity-10', r: 'rotate-12', cl: 'text-amber-300' },
            { c: 'ሪ', t: '25%', l: '2%', s: 'text-6xl', o: 'opacity-5', r: '-rotate-6', cl: 'text-green-200' },
            { c: 'ሲ', t: '40%', l: '45%', s: 'text-2xl', o: 'opacity-15', r: 'rotate-45', cl: 'text-amber-300' },
            { c: 'ቁ', t: '80%', l: '85%', s: 'text-5xl', o: 'opacity-8', r: '-rotate-12', cl: 'text-green-200' },
            { c: 'ቲ', t: '50%', l: '20%', s: 'text-3xl', o: 'opacity-12', r: 'rotate-3', cl: 'text-amber-300' },
            { c: 'ኑ', t: '10%', l: '50%', s: 'text-4xl', o: 'opacity-10', r: 'rotate-12', cl: 'text-green-200' },
            { c: 'ኢ', t: '30%', l: '30%', s: 'text-6xl', o: 'opacity-5', r: '-rotate-6', cl: 'text-amber-300' },
            { c: 'ኪ', t: '70%', l: '5%', s: 'text-2xl', o: 'opacity-15', r: 'rotate-45', cl: 'text-green-200' },
            { c: 'ዊ', t: '45%', l: '95%', s: 'text-5xl', o: 'opacity-8', r: '-rotate-12', cl: 'text-amber-300' },
            { c: 'ዚ', t: '95%', l: '60%', s: 'text-3xl', o: 'opacity-12', r: 'rotate-3', cl: 'text-green-200' },
            { c: 'ዪ', t: '15%', l: '15%', s: 'text-4xl', o: 'opacity-10', r: 'rotate-12', cl: 'text-amber-300' },
            { c: 'ዲ', t: '65%', l: '80%', s: 'text-6xl', o: 'opacity-5', r: '-rotate-6', cl: 'text-green-200' },
          ].map((item, idx) => (
            <span
              key={idx}
              className={`absolute ${item.s} ${item.o} ${item.r} ${item.cl} select-none pointer-events-none font-playfair`}
              style={{ top: item.t, left: item.l }}
            >
              {item.c}
            </span>
          ))}
        </div>

        <div className="absolute left-0 bottom-0 translate-y-1/2 -translate-x-1/4 opacity-10">
          <EthiopianCross className="w-[500px] h-[500px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 reveal" ref={addToRefs}>
          <div className="section-kicker border-white/20 bg-white/10 text-amber-400 mb-6">{t('home.newsletter_kicker')}</div>
          <h2 className="text-4xl md:text-6xl font-playfair font-black text-white mb-8">
            {t('home.newsletter_heading')}
          </h2>
          <p className="text-white mb-12 max-w-xl mx-auto">
            {t('home.newsletter_sub')}
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-full bg-white/10 border border-white/20 px-8 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
            <button className="btn-gold rounded-full px-10 py-4 font-black uppercase tracking-widest text-xs">
              {t('home.newsletter_btn')}
            </button>
          </form>
          <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/30">
            {t('home.newsletter_note')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
