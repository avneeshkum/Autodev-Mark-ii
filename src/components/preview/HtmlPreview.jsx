import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Maximize2, Minimize2, Globe, Loader2, Zap } from 'lucide-react';

export default function HtmlPreview({ url }) {
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // ✅ 1. SMART AUTO-SYNC
  // Jab URL badle, tabhi load karo.
  useEffect(() => {
    if (url && iframeRef.current) {
       // Check karte hain ki kya iframe mein already wahi URL hai
       // Agar haan, toh reload mat karo (loop rokne ke liye)
       const currentSrc = iframeRef.current.getAttribute('src');
       if (!currentSrc || !currentSrc.includes(url)) {
         setLoading(true);
         iframeRef.current.src = url;
       }
    }
  }, [url]);

  // ✅ 2. NUCLEAR CACHE-BUSTING REFRESH (Ye hai asli Jadu)
  // Hum URL ke aage '?t=12345' laga denge.
  // Isse Browser majboor ho jayega naya version fetch karne ke liye.
  const handleRefresh = () => {
    if (iframeRef.current && url) {
      setLoading(true);
      
      try {
        // Current Time milliseconds mein nikala
        const timestamp = new Date().getTime();
        
        // Check karo agar URL mein pehle se ? hai
        const separator = url.includes('?') ? '&' : '?';
        const newUrl = `${url}${separator}t=${timestamp}`;

        // Iframe ko naya URL force karo
        iframeRef.current.src = newUrl;
        
      } catch (e) {
        console.error("Refresh failed:", e);
        // Fallback: Agar upar wala fail ho jaye
        iframeRef.current.src = url;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-full w-full bg-[#0d1117] flex flex-col relative overflow-hidden border-l border-white/5"
    >
      {/* 🚀 NON-BLOCKING LOADER */}
      {/* Ye upar chalta rahega par screen ko safed nahi karega */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent z-50 animate-shimmer" />
      )}

      {/* --- HEADER --- */}
      <div className="h-10 px-4 flex items-center justify-between bg-[#161b22] border-b border-white/5 select-none z-20">
        <div className="flex items-center gap-1.5 w-20">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/90 shadow-sm" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/90 shadow-sm" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/90 shadow-sm" />
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <div className="flex items-center gap-2 bg-[#0d1117] border border-white/10 px-3 py-1 rounded-lg text-[11px] font-mono text-slate-400 group transition-all hover:border-white/20">
            <Globe size={10} className={url ? "text-blue-400" : "text-slate-600"} />
            <span className="truncate flex-1 opacity-70">
              {url ? url.replace('?t=', '').split('?')[0] : "System Standby..."}
            </span>
            {loading && <Loader2 size={10} className="animate-spin text-blue-500" />}
          </div>
        </div>

        <div className="flex items-center gap-1 w-20 justify-end">
          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            className="p-1.5 text-slate-500 hover:text-white transition-all active:scale-90 hover:bg-white/5 rounded-md"
            title="Force Refresh (Clear Cache)"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button onClick={toggleFullscreen} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-md">
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* 🖼️ PREVIEW AREA */}
      <div className="flex-1 bg-white relative isolate">
        <iframe
          ref={iframeRef}
          onLoad={() => setLoading(false)}
          className="w-full h-full border-none bg-white block"
          title="AutoDev Preview"
          allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
        />
        
        {/* Empty State */}
        {!url && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117] z-10">
             <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 animate-pulse">
                <Zap size={20} className="text-blue-500" />
             </div>
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
               Waiting for Output...
             </span>
          </div>
        )}
      </div>
    </div>
  );
}