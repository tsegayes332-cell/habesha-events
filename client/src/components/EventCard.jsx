import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatEthiopianDateShort } from '../utils/ethiopianCalendar';

const EventCard = ({ event }) => {
  const { t, i18n } = useTranslation();
  const formattedDate = formatEthiopianDateShort(event.start_date, i18n.language);
  const category = event.category ? t(`data.categories.${event.category}`, { defaultValue: event.category }) : t('eventcard.featured');
  const priceLabel = event.is_free ? t('event.free') : event.ticket_price ? `ETB ${event.ticket_price}` : t('eventcard.ticketed');
  const isEnded = event.end_date ? new Date(event.end_date) < new Date() : false;

  return (
    <Link
      to={`/events/${event.id}`}
      className="tilt-card group editorial-panel relative flex h-full flex-col overflow-hidden rounded-[28px] border border-amber-200/60 bg-white/92"
    >
      {/* Tibeb cultural stripe — always visible, animates on hover */}
      <div className="absolute top-0 left-0 right-0 z-10 overflow-hidden" aria-hidden="true">
        <svg width="100%" height="10" xmlns="http://www.w3.org/2000/svg" className="opacity-60 group-hover:opacity-100 transition-opacity duration-500">
          <defs>
            <pattern id={`tibeb-card-${event.id}`} x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 10,10 0,5" fill="none" stroke="#C8922A" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="10" fill={`url(#tibeb-card-${event.id})`} />
        </svg>
      </div>
      
      <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-gold" />
        <span>{priceLabel}</span>
      </div>

      {isEnded && (
        <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-charcoal/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
          <span>{t('eventcard.ended')}</span>
        </div>
      )}

      <div className="relative p-4 pb-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-imperial-green/5">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-imperial-green to-charcoal text-6xl font-playfair font-black text-gold">
              {event.title.charAt(0)}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent injera-texture" />

          <div className="absolute bottom-4 left-4 inline-flex rounded-full bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-patriot-red">
            {category}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 mesob-weave">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-imperial-green/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40">
            <MapPin className="w-3.5 h-3.5 text-patriot-red" />
            <span className="truncate max-w-[120px]">{event.location_name || event.city || t('eventcard.secret_venue')}</span>
          </div>
        </div>

        <h3 className="mb-3 text-[1.45rem] leading-tight text-charcoal font-playfair font-black group-hover:text-imperial-green transition-colors">
          {event.title}
        </h3>

        <p className="mb-6 text-sm leading-relaxed text-charcoal/60 line-clamp-3">
          {event.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-imperial-green/10 pt-4">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-charcoal/35">
            {t('eventcard.open_vibe')}
          </span>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold text-white shadow-gold transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
