const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-20">
      <div className="relative w-20 h-20">
        {/* Decorative Outer Ring */}
        <div className="absolute inset-0 border-2 border-gold/10 rounded-full scale-125"></div>
        
        {/* Main Spinner */}
        <div className="absolute top-0 left-0 w-full h-full border-[3px] border-gold/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-[3px] border-gold rounded-full border-t-transparent animate-spin"></div>
        
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gold rounded-full shadow-gold animate-pulse"></div>
      </div>
      
      <div className="mt-10 space-y-2 text-center">
        <p className="text-gold font-playfair font-black text-xl italic tracking-widest animate-pulse uppercase">Consulting the Stars</p>
        <p className="text-cream/30 font-black text-[10px] uppercase tracking-[0.3em]">Preparing your journey...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
