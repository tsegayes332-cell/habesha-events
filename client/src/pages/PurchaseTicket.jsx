import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, ShieldCheck, Mail, User, Phone, Ticket, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { formatEthiopianDate, formatEthiopianTime } from '../utils/ethiopianCalendar';

const PurchaseTicket = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    quantity: 1
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${(import.meta.env.VITE_API_URL || '')}/api/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPurchasing(true);
    setError('');

    try {
      const response = await axios.post(`${(import.meta.env.VITE_API_URL || '')}/api/tickets/purchase`, {
        event_id: id,
        ...formData
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment initialization failed. Please try again.');
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-espresso flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-gold animate-spin" />
    </div>
  );

  const price = event?.ticket_price || 0;
  const isEnded = event?.end_date ? new Date(event.end_date) < new Date() : false;

  if (isEnded) {
    return (
      <div className="min-h-screen bg-espresso flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-playfair font-black text-gold mb-6 italic">{t('event.ended_title')}</h2>
        <p className="text-cream/50 mb-10">{t('event.ended_message')}</p>
        <Link to={`/events/${id}`} className="btn-secondary">{t('purchase.back')}</Link>
      </div>
    );
  }

  if (!event || event.is_free) {
    return (
      <div className="min-h-screen bg-espresso flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-playfair font-black text-gold mb-6 italic">{t('purchase.title')}</h2>
        <p className="text-cream/50 mb-10">{t('purchase.subtitle')}</p>
        <Link to="/browse" className="btn-secondary">{t('purchase.back')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-espresso pt-32 pb-20 px-4 md:px-8">
      <Helmet>
        <title>Secure Access — {event.title}</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <Link 
          to={`/events/${id}`}
          className="inline-flex items-center space-x-2 text-gold font-black uppercase tracking-widest text-xs mb-10 hover:translate-x-[-4px] transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t('event.back')}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Form Side */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="habesha-card p-10 md:p-16 space-y-12 bg-card-bg/40 backdrop-blur-md border-gold/30">
              <div className="flex items-center space-x-5 mb-4">
                <div className="bg-gold p-4 rounded-xl shadow-gold">
                  <Ticket className="w-8 h-8 text-espresso" />
                </div>
                <h1 className="text-4xl md:text-5xl font-playfair font-black text-gold tracking-tight italic">{t('purchase.secure_access')}</h1>
              </div>

              {error && (
                <div className="p-4 bg-ethiopian-red/10 border border-ethiopian-red/30 rounded-button flex items-start space-x-3 text-ethiopian-red">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <p className="font-bold text-sm uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60">{t('purchase.name_label')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/40" />
                    <input 
                      required
                      type="text"
                      name="buyer_name"
                      value={formData.buyer_name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="habesha-input w-full pl-12 text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60">{t('purchase.email_label')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/40" />
                      <input 
                        required
                        type="email"
                        name="buyer_email"
                        value={formData.buyer_email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="habesha-input w-full pl-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60">{t('purchase.phone_label')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/40" />
                      <input 
                        required
                        type="tel"
                        name="buyer_phone"
                        value={formData.buyer_phone}
                        onChange={handleChange}
                        placeholder="09..."
                        className="habesha-input w-full pl-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-espresso/40 rounded-card border border-gold/10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60">{t('purchase.vouchers')}</p>
                    <div className="flex items-center space-x-4">
                      <select 
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="bg-card-bg px-8 py-3 rounded-button border border-gold/20 font-black text-2xl text-gold focus:outline-none cursor-pointer"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n} className="bg-espresso">{n}</option>)}
                      </select>
                      <span className="text-cream/30 font-bold">× ETB {price}</span>
                    </div>
                  </div>
                  <div className="text-center md:text-right space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60">{t('purchase.total')}</p>
                    <p className="text-5xl font-playfair font-black text-gold">ETB {price * formData.quantity}</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={purchasing}
                  className="btn-primary w-full py-6 text-xl font-playfair italic shadow-gold h-[80px]"
                >
                  {purchasing ? (
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                  ) : (
                    <span>{t('purchase.manifest')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Event Summary Side */}
          <div className="lg:col-span-1">
            <div className="habesha-card overflow-hidden bg-card-bg/20 sticky top-32 border-gold/10">
              <div className="h-56 relative">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gold/20 to-imperial-green/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-transparent to-transparent"></div>
              </div>
              
              <div className="p-8 space-y-8">
                <h3 className="text-2xl font-playfair font-black text-gold italic leading-tight">{event.title}</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Calendar className="w-5 h-5 mt-1 text-terracotta" />
                    <div>
                      <p className="font-playfair font-black text-cream text-lg">
                        {formatEthiopianDate(event.start_date, i18n.language)}
                      </p>
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cream/40 mt-1">
                        Starts {formatEthiopianTime(event.start_date, i18n.language)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="w-5 h-5 mt-1 text-terracotta" />
                    <div>
                      <p className="font-playfair font-black text-cream text-lg leading-tight">{event.location_name}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/40 mt-1">{event.city}, Ethiopia</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gold/10 space-y-4">
                  <div className="flex items-center space-x-3 text-forest">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('purchase.protected')}</span>
                  </div>
                  <p className="text-[10px] text-cream/30 font-medium leading-relaxed italic">
                    {t('purchase.chapa_note')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTicket;
