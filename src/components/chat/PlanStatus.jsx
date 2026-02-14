import React, { useEffect, useRef } from 'react';
import { Loader2, FileCode, CheckCircle2, Terminal, Cpu, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlanStatus({ plan = [], writingFiles = [], currentStep = 0 }) {
  const isExecuting = currentStep < plan.length;
  const progress = plan.length > 0 ? Math.min(Math.round((currentStep / plan.length) * 100), 100) : 0;
  
  const fileListRef = useRef(null);

  useEffect(() => {
    if (fileListRef.current) {
      fileListRef.current.scrollTo({
        top: fileListRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentStep, writingFiles.length]);

  if (!plan || plan.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[460px] mx-auto bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.12)] ring-1 ring-slate-200"
    >
      {/* --- HEADER (Darker Text & Icons) --- */}
      <div className="h-10 px-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Cpu size={14} className={isExecuting ? "text-blue-700 animate-pulse" : "text-emerald-700"} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-950 leading-none">
              AutoDev Mark II
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {progress}%
          </span>
          {!isExecuting && <CheckCircle2 size={13} strokeWidth={3} className="text-emerald-600" />}
        </div>
      </div>

      <div className="p-3.5 flex gap-4 items-start">
        {/* --- LEFT: BOLD LOGIC SEQUENCE --- */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5 px-1">
            <Terminal size={10} strokeWidth={3} />
            <span>Process Logs</span>
          </div>

          <div 
            ref={fileListRef} 
            className="space-y-2 max-h-[90px] overflow-y-auto pr-2 scrollbar-hide"
          >
            {plan.map((step, idx) => {
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;

              return (
                <div key={idx} className={`flex items-start gap-2.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="mt-1 shrink-0">
                    {isDone ? <CheckCircle2 size={12} strokeWidth={3} className="text-emerald-600" /> : 
                     isActive ? <Loader2 size={12} strokeWidth={3} className="text-blue-700 animate-spin" /> : 
                     <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300" />}
                  </div>
                  {/* ✅ TEXT DARKENED & BOLDED */}
                  <span className={`text-[11.5px] leading-tight ${isActive ? 'text-slate-950 font-black' : 'text-slate-600 font-bold'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT: CONDITIONAL ASSET TRACKER --- */}
        <div className="w-[160px] border-l-2 border-slate-100 pl-4 shrink-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Current Asset</span>
          </div>
          
          <div className="h-20 flex flex-col justify-center bg-slate-50/80 rounded-xl p-2.5 border border-slate-200 overflow-hidden relative shadow-inner">
            <AnimatePresence mode="wait">
              {isExecuting && writingFiles.length > 0 ? (
                <motion.div 
                  key="active-asset"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                     <FileCode size={12} strokeWidth={2.5} className="text-blue-700" />
                     {/* ✅ FILE NAME BOLDED */}
                     <span className="text-[10px] font-mono font-black text-slate-900 truncate w-full">
                       {writingFiles[writingFiles.length - 1].split('/').pop()}
                     </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
                       <span className="text-[8px] font-black text-blue-700 uppercase tracking-tighter">I/O Streaming</span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ x: [-50, 150] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-1/2 h-full bg-blue-600" 
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle-asset"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center space-y-1.5"
                >
                  <ShieldCheck size={22} strokeWidth={2.5} className="text-emerald-600/60" />
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tight">Sync Secured</span>
                  <span className="text-[8px] text-slate-500 font-mono font-bold uppercase">{writingFiles.length} Blobs</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-2.5 text-right px-1">
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mark II Vault</span>
          </div>
        </div>
      </div>

      {/* --- BOLD PROGRESS LINE --- */}
      <div className="h-1 w-full bg-slate-100">
        <motion.div 
          className={`h-full ${isExecuting ? 'bg-blue-700' : 'bg-emerald-600'} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}