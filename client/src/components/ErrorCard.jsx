import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ErrorCard = ({ message, onRetry }) => {
  const { t } = useTranslation();
  
  return (
    <div className="habesha-card p-12 text-center max-w-lg mx-auto my-12 border-ethiopian-red/30 bg-card-bg/20 backdrop-blur-md">
      <div className="bg-ethiopian-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-ethiopian-red/20 shadow-lg">
        <AlertCircle className="w-10 h-10 text-ethiopian-red" />
      </div>
      <h3 className="text-2xl font-playfair font-black mb-4 text-gold italic">{message || t('admin.error_msg')}</h3>
      <p className="text-cream/40 mb-10 font-medium italic tracking-wide">
        The spirits of the connection are restless. Please try to invoke the restoration.
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center space-x-3 px-10 py-4 bg-gold text-espresso rounded-button font-black uppercase tracking-widest hover:scale-105 transition-all shadow-gold active:scale-95 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Invoke Restoration</span>
        </button>
      )}
    </div>
  );
};

export default ErrorCard;
