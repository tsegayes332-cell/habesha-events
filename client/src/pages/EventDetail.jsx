import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  MapPin, Calendar as CalendarIcon, User, Ticket,
  ArrowLeft, Share2, Check
} from 'lucide-react';
import { formatEthiopianDate, formatEthiopianTime } from '../utils/ethiopianCalendar';
import LoadingSpinner from '../components/LoadingSpinner';

// ── Cultural Helpers ───────────────────────────────────────────────────
const TibebDivider = ({ id = 'tibeb' }) => (
  <div className="w-full overflow-hidden my-2" aria-hidden="true">
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
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8922A' fill-opacity='0.04'%3E%3Cpath d='M0 0h10v10H0zm10 10h10v10H10z'/%3E%3C/g%3E%3C/svg%3E")`,
};
// ───────────────────────────────────────────────────────────────────



const CrossIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold mx-auto my-12">
    <path d="M12 2v20M5 12h14M8 5l8 14M16 5L8 19" />
  </svg>
);

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${(import.meta.env.VITE_API_URL || '')}/api/events/${id}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Event not found or failed to load.');
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div className="py-32 flex justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-32 text-ethiopian-red font-playfair text-3xl font-black">{error}</div>;
  if (!event) return <div className="text-center py-32 text-cream/50 font-playfair text-3xl font-black">Event not found</div>;

  const currentUrl = window.location.href;
  const encodedTitle = encodeURIComponent(event.title);

  const startDate = formatEthiopianDate(event.start_date, i18n.language);
  const startTime = formatEthiopianTime(event.start_date, i18n.language);
  const endDate = formatEthiopianDate(event.end_date, i18n.language);
  const endTime = formatEthiopianTime(event.end_date, i18n.language);
  const isEnded = event.end_date ? new Date(event.end_date) < new Date() : false;

  const formatGCalDate = (date) => new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${formatGCalDate(event.start_date)}/${formatGCalDate(event.end_date)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(`${event.location_name}, ${event.city}`)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-habesha-white min-h-screen" style={wovenStyle}>
      <Helmet>
        <title>{event.title} — Habesha Events</title>
      </Helmet>

      {/* Hero Header */}
      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="kenburns w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-habesha-white to-cotton-cream flex items-center justify-center text-imperial-green text-9xl font-playfair font-black">
            {event.title.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-habesha-white via-habesha-white/40 to-transparent injera-texture"></div>
        <div className="absolute inset-0 bg-cross-pattern opacity-[0.03]" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-6xl mx-auto space-y-6">
            <Link to="/browse" className="inline-flex items-center space-x-2 text-imperial-green font-black uppercase tracking-[0.2em] text-[10px] hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('event.back')}</span>
            </Link>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-patriot-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                {t(`data.categories.${event.category}`) || event.category}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                event.is_free ? 'bg-imperial-green text-white' : 'bg-gold text-white'
              }`}>
                {event.is_free ? t('submit.free_event') : t('submit.paid_event')}
              </span>
              {isEnded && (
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-charcoal text-white">
                  {t('event.ended_title')}
                </span>
              )}
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-black text-imperial-green leading-tight tracking-tight max-w-4xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          <section>
            <div className="flex items-center space-x-4 mb-10 relative">
              <span className="absolute text-[6rem] font-bold opacity-5 select-none pointer-events-none text-amber-800 -z-10 -top-6 left-0" aria-hidden="true">ሀ</span>
              <div className="h-1 w-12 bg-gold"></div>
              <h2 className="text-imperial-green font-playfair font-black text-2xl uppercase tracking-wide">{t('event.about')}</h2>
            </div>
            <p className="text-charcoal/80 leading-relaxed text-xl font-medium whitespace-pre-wrap">
              {event.description}
            </p>
          </section>

          <CrossIcon />
          <TibebDivider id="tibeb-detail-mid" />

          <section>
            <div className="flex items-center space-x-4 mb-10 relative">
              <span className="absolute text-[6rem] font-bold opacity-5 select-none pointer-events-none text-amber-800 -z-10 -top-6 left-0" aria-hidden="true">ለ</span>
              <div className="h-1 w-12 bg-gold"></div>
              <h2 className="text-imperial-green font-playfair font-black text-2xl uppercase tracking-wide">{t('event.organizer')}</h2>
            </div>
            <div className="habesha-card p-8 flex items-center space-x-6 !bg-white/50 backdrop-blur-sm">
              <div className="w-20 h-20 bg-habesha-white rounded-full flex items-center justify-center border-2 border-imperial-green/10">
                <User className="w-10 h-10 text-imperial-green" />
              </div>
              <div>
                <h3 className="font-playfair font-black text-2xl text-imperial-green mb-2">{event.organizer_name}</h3>
                <div className="text-[10px] font-black uppercase tracking-widest text-charcoal/40">
                  {t('event.organizer')}
                </div>
              </div>
            </div>
          </section>

          <section className="pt-10">
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleCopyLink}
                className="flex items-center space-x-3 px-8 py-4 border-2 border-imperial-green/20 rounded-button font-black text-imperial-green hover:bg-imperial-green hover:text-white transition-all text-[10px] uppercase tracking-widest"
              >
                {copied ? <Check className="w-5 h-5 text-forest" /> : <Share2 className="w-5 h-5" />}
                <span>{copied ? 'Link Secured' : t('event.share')}</span>
              </button>
              <a 
                href={gCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-8 py-4 border-2 border-imperial-green/20 rounded-button font-black text-imperial-green hover:bg-imperial-green hover:text-white transition-all text-[10px] uppercase tracking-widest"
              >
                <CalendarIcon className="w-5 h-5" />
                <span>{t('event.add_calendar')}</span>
              </a>
            </div>
          </section>
        </div>

        {/* Sidebar Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="habesha-card rounded-[32px] p-10 sticky top-32 space-y-10 border-imperial-green/10 shadow-imperial bg-white/80 backdrop-blur-md tilet-border mesob-weave">
            <div className="space-y-8">
              <div className="flex items-start space-x-5">
                <div className="bg-habesha-white p-3 rounded-xl border border-imperial-green/10 text-imperial-green">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-imperial-green/40 uppercase tracking-[0.2em]">{t('browse.date')}</h4>
                  <p className="font-playfair font-black text-xl text-charcoal">{startDate}</p>
                  <p className="text-charcoal/40 font-black text-[10px] uppercase tracking-widest">{startTime}</p>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <div className="bg-habesha-white p-3 rounded-xl border border-imperial-green/10 text-imperial-green">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-imperial-green/40 uppercase tracking-[0.2em]">{t('event.ends')}</h4>
                  <p className="font-playfair font-black text-xl text-charcoal">{endDate}</p>
                  <p className="text-charcoal/40 font-black text-[10px] uppercase tracking-widest">{endTime}</p>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <div className="bg-habesha-white p-3 rounded-xl border border-imperial-green/10 text-imperial-green">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-imperial-green/40 uppercase tracking-[0.2em]">{t('event.location')}</h4>
                  <p className="font-playfair font-black text-xl text-charcoal leading-tight">{event.location_name}</p>
                  <p className="text-charcoal/40 font-black text-[10px] uppercase tracking-widest">{t(`data.cities.${event.city}`) || event.city}, Ethiopia</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-imperial-green/10 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-imperial-green/40 uppercase tracking-[0.2em]">{t('browse.price')}</span>
                <span className="text-3xl font-playfair font-black text-imperial-green">
                  {event.is_free ? t('event.free') : (event.ticket_price ? `ETB ${event.ticket_price}` : 'EXCLUSIVE')}
                </span>
              </div>
              
              {isEnded ? (
                <div className="w-full flex items-center justify-center space-x-3 py-5 rounded-button font-black bg-charcoal/5 text-charcoal/50 border border-charcoal/10 uppercase tracking-widest text-xs">
                  <span>{t('event.ended_message')}</span>
                </div>
              ) : event.is_free ? (
                event.ticket_url ? (
                  <a 
                    href={event.ticket_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center space-x-3 text-lg"
                  >
                    <Ticket className="w-6 h-6" />
                    <span>{t('event.get_tickets')}</span>
                  </a>
                ) : (
                  <div className="w-full flex items-center justify-center space-x-3 py-5 rounded-button font-black bg-imperial-green/5 text-imperial-green border border-imperial-green/10 uppercase tracking-widest text-xs">
                    <Check className="w-5 h-5" />
                    <span>{t('event.get_tickets')}</span>
                  </div>
                )
              ) : (
                <Link 
                  to={`/events/${event.id}/purchase`}
                  className="btn-primary w-full flex items-center justify-center space-x-3 text-lg font-playfair"
                >
                  <Ticket className="w-6 h-6" />
                  <span>{t('event.get_tickets')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
