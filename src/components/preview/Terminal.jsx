import { Terminal as TerminalIcon, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Terminal({ logs = [] }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll logic: Jab bhi naya log aaye, niche chalo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ANSI cleanup helper
  const stripAnsi = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  };

  // Helper function to colorize log levels
  const formatLog = (log) => {
    const cleanLog = stripAnsi(log);
    
    if (cleanLog.includes('[ERROR]')) return <span className="text-red-400 font-bold">{cleanLog}</span>;
    if (cleanLog.includes('[SYSTEM]')) return <span className="text-blue-400 font-bold">{cleanLog}</span>;
    if (cleanLog.includes('[SUCCESS]')) return <span className="text-emerald-400 font-bold">{cleanLog}</span>;
    if (cleanLog.includes('[PROCESS]')) return <span className="text-yellow-400 italic">{cleanLog}</span>;
    
    return cleanLog;
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] text-zinc-400 font-mono text-[12px] border-t border-white/5 overflow-hidden">
      
      {/* ================= TERMINAL HEADER ================= */}
      <div className="flex items-center justify-between px-4 h-9 bg-[#121214] border-b border-white/5 select-none shrink-0">
        <div className="flex items-center gap-3">
          <TerminalIcon size={14} className="text-zinc-500" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Output
            </span>
            <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
            <span className="text-[10px] text-zinc-600">bash — autodev</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/5 rounded border border-emerald-500/10">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tight">System Online</span>
           </div>
        </div>
      </div>

      {/* ================= LOGS CONTENT AREA ================= */}
      <div className="flex-1 overflow-y-auto p-5 relative custom-scrollbar bg-[#09090b]">
        
        {/* Subtle Scanline Overlay for aesthetic */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

        <div className="relative z-10 space-y-1">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="leading-relaxed break-words whitespace-pre-wrap">
                {formatLog(log)}
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 opacity-20 italic text-[11px]">
              <ShieldCheck size={12} />
              <span>Kernel initialized. Awaiting process instructions...</span>
            </div>
          )}
          
          {/* Active Process Cursor */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-emerald-500 font-bold">➜</span>
            <span className="text-zinc-600">~/workspace</span>
            <span className="inline-block w-2 h-4 bg-emerald-500/50 animate-pulse"></span>
          </div>
        </div>

        {/* This invisible div ensures we can scroll to the bottom */}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
}