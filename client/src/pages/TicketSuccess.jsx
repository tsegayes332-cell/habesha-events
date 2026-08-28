import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Ticket, ArrowRight, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const TicketSuccess = () => {
  const [searchParams] = useSearchParams();
  const ticketCode = searchParams.get('code');
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center py-32 px-4 relative overflow-hidden">
      <Helmet>
        <title>{t('success.title')} — Habesha Events</title>
      </Helmet>

      {/* Decorative Background Art */}
      <div className="absolute inset-0 bg-cross-pattern opacity-[0.12]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/0 via-espresso/80 to-espresso"></div>

      <div className="max-w-3xl w-full text-center relative z-10 space-y-12">
        <div className="space-y-6">
          <div className="mb-10 inline-flex items-center justify-center p-8 bg-gold/10 border border-gold/30 rounded-full text-gold animate-bounce shadow-gold">
            <CheckCircle className="w-20 h-20" />
          </div>

          <h1 className="text-5xl md:text-7xl font-playfair font-black text-gold italic leading-tight">{t('success.title')}</h1>
          <p className="text-xl text-cream/60 font-medium max-w-xl mx-auto italic">{t('success.subtitle')}</p>
        </div>

        <div className="habesha-card p-10 md:p-16 border-gold/40 shadow-gold relative overflow-hidden bg-card-bg/60 backdrop-blur-md">
          {/* Artistic Texture */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full -mr-20 -mt-20"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 text-left">
            <div className="space-y-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-4">{t('success.voucher_code')}</p>
                <div className="flex items-center space-x-3">
                  <div className="bg-espresso px-8 py-4 rounded-button border-2 border-dashed border-gold/30 font-ethiopic text-3xl font-black text-gold shadow-gold tracking-widest">
                    {ticketCode}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 text-cream font-black uppercase tracking-[0.2em] text-xs">
                  <Ticket className="w-6 h-6 text-terracotta" />
                  <span>{t('success.confirmed_voucher')}</span>
                </div>
                <p className="text-sm text-cream/40 leading-relaxed font-medium italic max-w-sm">
                  {t('success.voucher_note')}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5 flex-shrink-0">
              <Link 
                to="/browse"
                className="btn-primary flex items-center justify-center space-x-4 px-10 h-[64px] font-playfair italic text-lg"
              >
                <span>{t('success.more_vibes')}</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
              <button className="btn-secondary flex items-center justify-center space-x-4 h-[64px] font-black text-xs uppercase tracking-widest">
                <Share2 className="w-5 h-5" />
                <span>{t('success.share')}</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-cream/30 font-black text-xs uppercase tracking-[0.3em]">
          {t('success.contact_keepers')}
        </p>
      </div>
    </div>
  );
};

export default TicketSuccess;
