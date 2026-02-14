import { useState, useEffect } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

// --- 🖼️ SLIDESHOW IMAGES ---
const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2370&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2370&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=2148&auto=format&fit=crop"  
];

export default function Welcome() {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Image Slideshow Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % DEMO_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full bg-white flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-700 font-sans">
      
      {/* Header */}
      <div className="text-center mb-12 space-y-3 z-10">
         <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 mb-2 shadow-sm border border-blue-100 animate-bounce">
            <Sparkles size={28} />
         </div>
         <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
           What will we build today?
         </h2>
         <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
           AutoDev is ready. Describe your idea, and watch the code appear.
         </p>
      </div>

      {/* --- MULTIPLE CARDS STACK (Ek ke baad ek) --- */}
      <div className="relative flex items-center justify-center w-full max-w-xl py-10">
        
        {/* Left Arrow */}
        <button className="hidden md:flex absolute left-4 p-3 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all z-30 border border-transparent hover:border-slate-200">
          <ChevronLeft size={24} />
        </button>

        {/* STACK CONTAINER */}
        <div className="relative w-80 h-60 mx-10 perspective-1000">
          
          {/* Card 4 (Sabse Peeche - Chhota aur Dhundhla) */}
          <div className="absolute inset-0 bg-slate-50 rounded-2xl border border-slate-100 transform scale-[0.80] translate-y-9 opacity-30 z-0"></div>

          {/* Card 3 (Thoda Aage) */}
          <div className="absolute inset-0 bg-slate-100 rounded-2xl border border-slate-200 transform scale-[0.85] translate-y-6 opacity-60 z-10"></div>
          
          {/* Card 2 (Aur Aage) */}
          <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200 shadow-sm transform scale-[0.92] translate-y-3 opacity-90 z-20"></div>

          {/* CARD 1 (MAIN FRONT CARD - Slideshow Wala) */}
          <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-30 transition-transform hover:-translate-y-2 duration-500 group">
            
            {/* Changing Images */}
            {DEMO_IMAGES.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt="Preview"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out
                  ${index === currentImgIndex ? 'opacity-100' : 'opacity-0'}
                `}
              />
            ))}

            {/* Dark Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

            {/* Text Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-white">
              <h3 className="text-lg font-bold mb-1 drop-shadow-md tracking-wide">
                AutoDev Gallery
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Infinite possibilities, One prompt away.
              </p>
            </div>

          </div>
        </div>

        {/* Right Arrow */}
        <button className="hidden md:flex absolute right-4 p-3 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all z-30 border border-transparent hover:border-slate-200">
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Footer Text */}
      <div className="mt-12 flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-400 font-medium">
         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
         Agent Standing By
      </div>
      
    </div>
  );
}