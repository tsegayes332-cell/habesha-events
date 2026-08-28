import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

const categories = ['Music', 'Tech', 'Sports', 'Culture', 'Food', 'Business', 'Art', 'Education'];
const cities = ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar', 'Hawassa', 'Adama', 'Jimma', 'Dessie', 'Shashemene', 'Arba Minch', 'Hosaena', 'Sodo', 'Harar', 'Jijiga', 'Assosa', 'Gambela', 'Semera'];

const SubmitEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    city: '',
    location_name: '',
    start_date: '',
    end_date: '',
    image_url: '',
    ticket_url: '',
    organizer_name: '',
    organizer_email: '',
    is_free: true,
    ticket_price: '',
    ticket_capacity: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Event title is required';
    if (!formData.description) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.location_name) newErrors.location_name = 'Location name is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.organizer_name) newErrors.organizer_name = 'Organizer name is required';
    if (!formData.organizer_email) {
      newErrors.organizer_email = 'Organizer email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.organizer_email)) {
      newErrors.organizer_email = 'Invalid email address';
    }

    if (!formData.is_free && !formData.ticket_price) {
      newErrors.ticket_price = 'Ticket price is required for paid events';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setSubmitError('Image upload is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Create an image object to compress
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      // Resize to max 1200px width/height
      const MAX_SIZE = 1200;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to WebP or JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      const cloudinaryData = new FormData();
      cloudinaryData.append('file', compressedDataUrl);
      cloudinaryData.append('upload_preset', uploadPreset);

      axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, cloudinaryData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      })
      .then(response => {
        setFormData(prev => ({ ...prev, image_url: response.data.secure_url }));
        setUploading(false);
      })
      .catch(err => {
        console.error('Upload error details:', JSON.stringify(err.response?.data || err, null, 2));
        setSubmitError('Failed to upload image. Please try again.');
        setUploading(false);
      });
    };
    
    img.onerror = () => {
      setSubmitError('Failed to read image file. Please try again.');
      setUploading(false);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${(import.meta.env.VITE_API_URL || '')}/api/events/submit`, formData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission error:', err);
      let errorMsg = 'Failed to submit event. Please try again.';
      if (err.response?.data?.error) {
        errorMsg = typeof err.response.data.error === 'string' 
          ? err.response.data.error 
          : err.response.data.error.message || JSON.stringify(err.response.data.error);
      }
      setSubmitError(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <Helmet>
          <title>Success — Habesha Events</title>
        </Helmet>
        <div className="bg-imperial-green/10 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 border border-imperial-green/20 shadow-imperial">
          <CheckCircle className="w-16 h-16 text-imperial-green" />
        </div>
        <h1 className="text-5xl font-playfair font-black mb-6 text-imperial-green">{t('submit.success_title')}</h1>
        <p className="text-charcoal/40 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          {t('submit.success_msg')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => setSubmitted(false)}
            className="btn-secondary w-full sm:w-auto"
          >
            {t('submit.submit_another')}
          </button>
          <Link 
            to="/browse"
            className="btn-primary w-full sm:w-auto"
          >
            {t('submit.browse_events')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-habesha-white pt-32 pb-20 px-4 md:px-8">
      <Helmet>
        <title>Host Your Vibe — Habesha Events</title>
      </Helmet>

      {/* Cultural Banner */}
      <section className="mb-12 relative overflow-hidden bg-imperial-green rounded-[36px] p-8 md:p-12 text-white">
        <div className="absolute inset-0 ethiopian-cross opacity-[0.08]" />
        <div className="max-w-2xl relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 mb-3">✦ ምስጋና</p>
          <h2 className="text-4xl md:text-5xl font-playfair font-black mb-4">
            Share Your Ethiopian Event
          </h2>
          <p className="text-lg text-white">
            Celebrate our rich heritage, diaspora creativity, and the moments that bring us together. Whether it's a festival, concert, food ceremony, or gathering — bring your vision to Habesha Events.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* Left Column - Artistic Branding */}
        <div className="hidden lg:block sticky top-32 space-y-12">
          <div className="space-y-6">
            <h1 className="text-7xl font-playfair font-black text-imperial-green leading-tight">
              {t('submit.title')} <br /> <span className="text-patriot-red italic">{t('submit.highlight')}</span>
            </h1>
            <div className="h-1 w-24 bg-gold rounded-full"></div>
            <p className="text-charcoal/40 text-xl font-medium max-w-md leading-relaxed">
              {t('submit.subtitle')}
            </p>
          </div>
          
          <div className="relative">
             <span className="text-[300px] font-ethiopic text-imperial-green opacity-[0.05] leading-none select-none">ዝ</span>
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-imperial-green/10"></div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full">
          <div className="lg:hidden text-center mb-12 space-y-4">
             <h1 className="text-5xl font-playfair font-black text-imperial-green">{t('submit.title')} {t('submit.highlight')}</h1>
             <p className="text-charcoal/40 font-medium">{t('submit.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="habesha-card p-8 md:p-12 space-y-12 border-imperial-green/10 bg-white/50 backdrop-blur-md shadow-imperial">
            {submitError && (
              <div className="p-4 bg-patriot-red/5 border border-patriot-red/20 rounded-button flex items-center space-x-3 text-patriot-red">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-bold text-sm uppercase tracking-widest">{submitError}</p>
              </div>
            )}

            <div className="space-y-12">
              {/* Basic Info */}
              <div className="space-y-8">
                <h2 className="text-imperial-green font-playfair font-black text-xl uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-gold rounded-full"></div>
                  <span>{t('submit.basic_info')}</span>
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.event_title')}</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Moonlight Jazz Festival"
                      className={`habesha-input w-full text-lg ${errors.title ? 'border-patriot-red focus:border-patriot-red' : ''}`}
                    />
                    {errors.title && <p className="text-patriot-red text-[10px] font-black uppercase tracking-widest">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.description')}</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Tell us the story of this night (min 50 chars)..."
                      className={`habesha-input w-full text-lg resize-none ${errors.description ? 'border-patriot-red focus:border-patriot-red' : ''}`}
                    ></textarea>
                    {errors.description && <p className="text-patriot-red text-[10px] font-black uppercase tracking-widest">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.category')}</label>
                      <select 
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="habesha-input w-full"
                      >
                        <option value="">{t('browse.category')}</option>
                        {categories.map(c => <option key={c} value={c} className="bg-white text-charcoal">{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.price_model')}</label>
                      <div className="flex bg-cotton-cream border border-imperial-green/10 p-1.5 rounded-button h-[54px]">
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, is_free: true }))}
                          className={`flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.is_free ? 'bg-gold text-white shadow-gold' : 'text-charcoal/20'}`}
                        >
                          {t('submit.free_event')}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, is_free: false }))}
                          className={`flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!formData.is_free ? 'bg-gold text-white shadow-gold' : 'text-charcoal/20'}`}
                        >
                          {t('submit.paid_event')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {!formData.is_free && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">Ticket Price (ETB)</label>
                        <input 
                          type="number" 
                          name="ticket_price"
                          value={formData.ticket_price}
                          onChange={handleChange}
                          placeholder="0"
                          className="habesha-input w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">Max Sanctuary Capacity</label>
                        <input 
                          type="number" 
                          name="ticket_capacity"
                          value={formData.ticket_capacity}
                          onChange={handleChange}
                          placeholder="Infinite"
                          className="habesha-input w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Time */}
              <div className="space-y-8">
                <h2 className="text-imperial-green font-playfair font-black text-xl uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-gold rounded-full"></div>
                  <span>{t('submit.date_location')}</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.city')}</label>
                    <select name="city" value={formData.city} onChange={handleChange} className="habesha-input w-full">
                      <option value="">{t('submit.city')}</option>
                      {cities.map(c => <option key={c} value={c} className="bg-white text-charcoal">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.location_name')}</label>
                    <input type="text" name="location_name" value={formData.location_name} onChange={handleChange} placeholder="Millennium Hall" className="habesha-input w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.start_date')}</label>
                    <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} className="habesha-input w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.end_date')}</label>
                    <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} className="habesha-input w-full" />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-8">
                <h2 className="text-imperial-green font-playfair font-black text-xl uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-gold rounded-full"></div>
                  <span>{t('submit.media')}</span>
                </h2>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.event_image')}</label>
                   <div className="relative group border-2 border-dashed border-imperial-green/10 rounded-card p-10 bg-cotton-cream flex flex-col items-center justify-center min-h-[300px] transition-all hover:bg-white/80">
                      {formData.image_url ? (
                        <div className="relative w-full aspect-video rounded-button overflow-hidden border border-imperial-green/10 shadow-imperial">
                           <img src={formData.image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                           <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                            className="absolute top-4 right-4 bg-espresso/80 text-gold p-3 rounded-full border border-gold/40 backdrop-blur-md"
                           >
                            <X className="w-5 h-5" />
                           </button>
                        </div>
                      ) : uploading ? (
                        <div className="text-center space-y-6">
                           <Loader2 className="w-12 h-12 text-imperial-green animate-spin mx-auto" />
                           <p className="text-imperial-green font-black uppercase tracking-[0.2em] text-xs">Capturing Vision {uploadProgress}%</p>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-center space-y-6">
                           <div className="w-20 h-20 bg-imperial-green/5 rounded-full flex items-center justify-center mx-auto border border-imperial-green/10 group-hover:scale-110 transition-transform">
                              <Upload className="w-10 h-10 text-imperial-green" />
                           </div>
                           <div className="space-y-2">
                              <p className="text-charcoal font-black text-[10px] uppercase tracking-widest">{t('submit.upload_prompt')}</p>
                              <p className="text-charcoal/20 text-xs font-black uppercase">{t('submit.upload_hint')}</p>
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                      )}
                   </div>
                </div>
              </div>

              {/* Host Identity */}
              <div className="space-y-8">
                <h2 className="text-imperial-green font-playfair font-black text-xl uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-gold rounded-full"></div>
                  <span>{t('submit.organizer')}</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.organizer_name')}</label>
                    <input type="text" name="organizer_name" value={formData.organizer_name} onChange={handleChange} placeholder="Your Name or Org" className="habesha-input w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/40">{t('submit.organizer_email')}</label>
                    <input type="email" name="organizer_email" value={formData.organizer_email} onChange={handleChange} placeholder="spirit@host.com" className="habesha-input w-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-imperial-green/10">
              <button 
                type="submit" 
                disabled={loading || uploading}
                className="btn-primary w-full flex items-center justify-center space-x-4 !text-xl shadow-gold disabled:opacity-30 h-[72px]"
              >
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <span>{t('submit.submit_btn')}</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitEvent;
