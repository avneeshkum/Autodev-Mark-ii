import React, { useEffect, useRef } from "react";
import { FileCode, Lock, Code2, Hash } from "lucide-react";

export default function CodeEditor({ file, content }) {
  const scrollRef = useRef(null);

  // Jab content badle, toh scroll upar le jao
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [file]);

  // 1. Empty State: Jab tak koi file select nahi hoti
  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d0d0d] text-zinc-700 select-none border-l border-white/5">
        <div className="relative mb-6">
          <Code2 size={64} className="opacity-5" />
          <div className="absolute inset-0 blur-2xl bg-blue-500/10 rounded-full" />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
          Select a file to inspect source
        </p>
      </div>
    );
  }

  // 2. Data Preparation
  const lines = content ? content.split(/\r?\n/) : [""];
  const fileExt = file.split('.').pop().toLowerCase();

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-zinc-300 font-mono text-[13px] overflow-hidden border-l border-white/5">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-5 bg-[#141414] border-b border-white/5 select-none h-11 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-500/10 rounded-md">
            <FileCode size={14} className="text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-zinc-200 tracking-tight leading-none mb-1">
              {file.split('/').pop()}
            </span>
            <span className="text-[9px] text-zinc-500 font-medium leading-none">
              {file}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* File Extension Badge */}
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            {fileExt}
          </span>
          
          {/* Read Only Badge */}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 bg-blue-500/5 px-2 py-1 rounded-full border border-blue-500/10 uppercase tracking-tighter">
            <Lock size={10} />
            <span>Read Only</span>
          </div>
        </div>
      </div>

      {/* ================= EDITOR BODY ================= */}
      <div className="flex-1 overflow-auto flex scrollbar-thin scrollbar-thumb-zinc-800" ref={scrollRef}>
        
        {/* Line Numbers Gutter */}
        <div className="flex flex-col items-end py-4 bg-[#0d0d0d] border-r border-white/5 text-zinc-700 min-w-[3.5rem] select-none sticky left-0 z-10">
          {lines.map((_, i) => (
            <div key={i} className="h-6 flex items-center justify-end px-4 text-[10px] font-medium opacity-50 hover:text-zinc-400 transition-colors">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Content Area */}
        <div className="flex-1 relative min-w-0">
          {/* Active Line Highlight Layer (Simple version) */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
            {lines.map((_, i) => (
              <div key={i} className="h-6 w-full border-b border-white" />
            ))}
          </div>

          <pre className="py-4 px-6 leading-6 whitespace-pre tab-[4] m-0 relative z-20">
            <code className="block font-mono">
              {content || <span className="text-zinc-800 italic">// This file is empty</span>}
            </code>
          </pre>
        </div>
      </div>

      {/* ================= FOOTER (Optional Status Bar) ================= */}
      <div className="h-6 bg-[#141414] border-t border-white/5 px-4 flex items-center justify-between text-[10px] text-zinc-600 font-medium select-none shrink-0">
        <div className="flex items-center gap-4">
          <span>Lines: {lines.length}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-1">
          <Hash size={10} />
          <span>Indent: 2 Spaces</span>
        </div>
      </div>

    </div>
  );
}