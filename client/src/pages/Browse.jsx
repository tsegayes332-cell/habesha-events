import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Filter,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from 'lucide-react';
import axios from 'axios';
import EventCard from '../components/EventCard';

// ── Cultural Helpers ───────────────────────────────────────────────────────────
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

const wovenStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8922A' fill-opacity='0.05'%3E%3Cpath d='M0 0h10v10H0zm10 10h10v10H10z'/%3E%3C/g%3E%3C/svg%3E")`,
};
// ──────────────────────────────────────────────────────────────────────────

const categories = ['All Categories', 'Music', 'Tech', 'Sports', 'Culture', 'Food', 'Business', 'Art', 'Education'];
const cities = ['All Cities', 'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar', 'Hawassa', 'Adama', 'Jimma', 'Dessie', 'Shashemene', 'Arba Minch', 'Hosaena', 'Sodo', 'Harar', 'Jijiga', 'Assosa', 'Gambela', 'Semera'];
const ranges = ['today', 'this_week', 'this_month'];





const FilterPanel = ({ searchParams, updateFilters, clearFilters, closeMobile }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-imperial-green/55">
          <MapPin className="w-3.5 h-3.5" />
          <span>{t('browse.city')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => updateFilters({ city, page: 1 })}
              className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${(searchParams.get('city') === city || (!searchParams.get('city') && city === 'All Cities'))
                  ? 'bg-imperial-green text-white shadow-imperial'
                  : 'bg-habesha-white text-charcoal/60 border border-imperial-green/10'
                }`}
            >
              {t(`data.cities.${city}`) || city}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-imperial-green/55">
          <Tag className="w-3.5 h-3.5" />
          <span>{t('browse.category')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => updateFilters({ category, page: 1 })}
              className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${(searchParams.get('category') === category || (!searchParams.get('category') && category === 'All Categories'))
                  ? 'bg-patriot-red text-white shadow-lg'
                  : 'bg-habesha-white text-charcoal/60 border border-imperial-green/10'
                }`}
            >
              {t(`data.categories.${category}`) || category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-imperial-green/55">
          <Calendar className="w-3.5 h-3.5" />
          <span>{t('browse.date')}</span>
        </div>
        <div className="space-y-2">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => updateFilters({ date_range: searchParams.get('date_range') === range ? '' : range, page: 1 })}
              className={`w-full rounded-2xl px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] transition-all ${searchParams.get('date_range') === range
                  ? 'bg-gold text-white shadow-gold'
                  : 'bg-habesha-white text-charcoal/60 border border-imperial-green/10'
                }`}
            >
              {t(`data.ranges.${range}`) || range.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-imperial-green/55">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{t('browse.price')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { labelKey: 'browse.all', value: '' },
            { labelKey: 'browse.free', value: 'true' },
            { labelKey: 'browse.paid', value: 'false' },
          ].map((option) => (
            <button
              key={option.labelKey}
              onClick={() => updateFilters({ is_free: option.value, page: 1 })}
              className={`rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${(searchParams.get('is_free') || '') === option.value
                  ? 'bg-charcoal text-white'
                  : 'bg-habesha-white text-charcoal/60 border border-imperial-green/10'
                }`}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={clearFilters} className="btn-outline-gold flex-1 rounded-full px-5 py-3 text-xs">
          {t('browse.reset')}
        </button>
        {closeMobile && (
          <button onClick={closeMobile} className="btn-primary flex-1 rounded-full px-5 py-3 text-xs">
            {t('browse.show_results')}
          </button>
        )}
      </div>
    </div>
  );
};

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { t } = useTranslation();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const skipFirstSearch = useRef(true);

  const limit = 12;

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const params = {};
        ['search', 'city', 'category', 'is_free', 'date_range', 'sort'].forEach((key) => {
          const val = searchParams.get(key);
          if (val) params[key] = val;
        });
        params.page = page;
        params.limit = limit;
        const res = await axios.get(`${(import.meta.env.VITE_API_URL || '')}/api/events/filter`, { params });
        if (cancelled) return;
        const fetched = res.data?.events || [];
        setEvents((prev) => (page === 1 ? fetched : [...prev, ...fetched]));
        setTotal(res.data?.total || 0);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        if (!cancelled) {
          setEvents((prev) => (page === 1 ? [] : prev));
          setTotal(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [searchParams, page]);

  // Debounce search input → URL (avoids an API call per keystroke)
  useEffect(() => {
    if (skipFirstSearch.current) {
      skipFirstSearch.current = false;
      return undefined;
    }
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) next.set('search', searchInput);
        else next.delete('search');
        return next;
      });
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  const sort = searchParams.get('sort') || 'soonest';

  const updateFilters = (newFilters) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newFilters };

    Object.keys(updated).forEach((key) => {
      if (!updated[key] || updated[key] === 'All Cities' || updated[key] === 'All Categories') {
        delete updated[key];
      }
    });

    setPage(1);
    setSearchParams(updated);
  };

  const clearFilters = () => {
    setSearchInput('');
    setPage(1);
    setSearchParams({});
  };

  const loadMore = () => {
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <Helmet>
        <title>Browse Habesha Events - Discover Ethiopian Cultural Experiences</title>
      </Helmet>

      {/* Ethiopian Cultural Header Banner */}
      <section className="mb-8 relative overflow-hidden bg-imperial-green py-10">
        <div className="absolute inset-0 ethiopian-cross opacity-[0.06]" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">{t('browse.header_kicker')}</p>
          <h1 className="text-2xl md:text-3xl font-playfair font-black text-white mt-2">
            {t('browse.discover_title')}
          </h1>
          <p className="text-sm text-white max-w-2xl mx-auto mt-3">
            {t('browse.discover_sub')}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="editorial-panel relative overflow-hidden rounded-[36px] bg-charcoal px-6 py-10 text-white md:px-10 md:py-12" style={wovenStyle}>
          <div className="aurora-blob left-[-8%] top-[-30%] h-64 w-64 bg-gold/30" />
          <div className="aurora-blob right-[-6%] top-[-20%] h-56 w-56 bg-patriot-red/25" style={{ animationDelay: '-7s' }} />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <div className="floating-chip animate-fade-up" style={{ animationDelay: '0.05s' }}>
                <Filter className="w-4 h-4 text-gold" />
                <span>{t('browse.fun_to_browse')}</span>
              </div>
              <div className="animate-fade-up relative mt-5" style={{ animationDelay: '0.2s' }}>
                <span className="absolute text-[8rem] font-bold opacity-5 select-none pointer-events-none text-amber-400 -z-10 -top-4 left-0" aria-hidden="true">ሐ</span>
                <h1 className="text-5xl font-playfair font-black tracking-wide leading-[0.94] md:text-7xl">
                  {t('browse.pick_city')}
                  <span className="block text-gold italic text-shimmer-gold">{t('browse.pick_mood')}</span>
                </h1>
              </div>
              <p className="animate-fade-up mt-4 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base" style={{ animationDelay: '0.35s' }}>
                {t('browse.browse_subtitle')}
              </p>
            </div>

            <div className="editorial-panel animate-fade-up rounded-[30px] bg-white/10 p-3 backdrop-blur-md" style={{ animationDelay: '0.5s' }}>
              <div className="search-pill bg-white rounded-[24px] px-5 py-4 border-none">
                <Search className="w-5 h-5 text-imperial-green" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t('browse.search_placeholder')}
                  className="w-full bg-transparent p-0 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <TibebDivider id="tibeb-browse-hero" />

      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-10">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="hidden lg:block">
            <div className="editorial-panel sticky top-28 rounded-[30px] p-6 mesob-weave">
              <FilterPanel
                searchParams={searchParams}
                updateFilters={updateFilters}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden btn-primary rounded-full px-5 py-4 text-xs self-start"
              >
                <Filter className="w-4 h-4 mr-2" />
                {t('browse.open_filters')}
              </button>

              <div className="flex flex-wrap gap-3">
                {['Music', 'Food', 'Culture', 'Art'].map((item) => (
                  <button
                    key={item}
                    onClick={() => updateFilters({ category: item, page: 1 })}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${searchParams.get('category') === item
                        ? 'bg-patriot-red text-white'
                        : 'bg-white border border-imperial-green/10 text-imperial-green'
                      }`}
                  >
                    {t(`data.categories.${item}`) || item}
                  </button>
                ))}
              </div>

              <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 border border-imperial-green/10 text-[10px] font-black uppercase tracking-[0.18em] text-charcoal/45">
                <span>{t('browse.showing', { shown: events.length, total })}</span>
                <select
                  value={sort}
                  onChange={(event) => updateFilters({ sort: event.target.value, page: 1 })}
                  className="bg-transparent text-imperial-green focus:outline-none"
                >
                  <option value="soonest">{t('browse.soonest')}</option>
                  <option value="newest">{t('browse.newest')}</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-imperial-green/20 border-t-imperial-green" />
              </div>
            ) : events.length === 0 ? (
              <div className="editorial-panel rounded-[32px] p-12 text-center">
                <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-imperial-green/5 text-imperial-green">
                  <Search className="w-8 h-8" />
                </div>
                <h2 className="mt-6 text-3xl font-playfair font-black text-imperial-green">
                  {t('browse.no_results')}
                </h2>
                <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed text-charcoal/55">
                  {t('browse.no_results_sub')}
                </p>
                <button onClick={clearFilters} className="btn-primary mt-7 rounded-full px-6 py-4 text-xs">
                  {t('browse.clear_filters')}
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {events.map((event, idx) => (
                    <div key={event.id} className="animate-fade-up h-full" style={{ animationDelay: `${Math.min(idx, 8) * 0.06}s` }}>
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
                {total > events.length && (
                  <div className="flex justify-center pt-12">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="btn-outline-gold rounded-full px-8 py-4 text-xs"
                    >
                      {loadingMore ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t('browse.load_more')
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            className="absolute inset-0 bg-charcoal/45 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[34px] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-imperial-green/45">
                  {t('browse.filter_kicker')}
                </div>
                <h3 className="mt-2 text-3xl font-playfair font-black text-imperial-green">
                  {t('browse.filter_title')}
                </h3>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="rounded-full bg-habesha-white p-3 text-imperial-green"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterPanel
              searchParams={searchParams}
              updateFilters={updateFilters}
              clearFilters={clearFilters}
              closeMobile={() => setIsFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Browse;
