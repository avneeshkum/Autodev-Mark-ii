import React from 'react';
import PlanStatus from './PlanStatus';

export default function ChatMessage({ role, content, plan, writingFiles, currentStep }) {
  const isUser = role === "user";
  
  // 1. 🔍 Build Mode Detection
  const isBuildMessage = !isUser && (
    content.includes("<plan>") || 
    content.includes("<autodevArtifact>") || 
    (plan && plan.length > 0)
  );

  // 2. 🧹 XML Cleaning
  const getCleanText = (text) => {
    return text
      .replace(/<autodevArtifact[\s\S]*?<\/autodevArtifact>/g, '')
      .replace(/<plan>[\s\S]*?<\/plan>/g, '')
      .trim();
  };

  const cleanText = isUser ? content : getCleanText(content);
  const activeFile = writingFiles?.[writingFiles.length - 1];

  // =================================================================
  // 🚀 RENDER 1: AGENT BUILD MODE (Premium Action Card)
  // =================================================================
  if (isBuildMessage) {
    return (
      <div className="flex w-full mb-8 justify-start animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="w-full max-w-2xl">
          {cleanText && (
            <div className="text-slate-400 text-[14px] mb-4 px-1 font-medium leading-relaxed italic">
              {cleanText}
            </div>
          )}
          <PlanStatus 
            plan={plan || []} 
            writingFiles={writingFiles || []} 
            currentStep={currentStep || 0} 
            activeFile={activeFile}
          />
          <div className="text-[9px] mt-2 opacity-20 font-black uppercase tracking-[0.3em] px-1 text-blue-400">
            Process Engine Active
          </div>
        </div>
      </div>
    );
  }

  // =================================================================
  // 📝 RENDER 2: USER (Sundar Bubble) & AGENT (Plain Text)
  // =================================================================
  return (
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        /* ✅ USER: Sundar Bubble Style */
        <div className="max-w-[85%] group">
          <div className="text-[10px] mb-1.5 opacity-40 font-bold uppercase tracking-widest text-right px-1">
            Requester
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-[0_4px_15px_rgba(37,99,235,0.2)] border border-blue-400/20">
            <div className="text-[14px] font-medium leading-relaxed whitespace-pre-wrap">
              {cleanText}
            </div>
          </div>
        </div>
      ) : (
        /* ✅ AGENT: Elite Plain Text (No Bubble) */
        <div className="max-w-[90%] transition-all duration-500">
          <div className="text-[10px] mb-1.5 opacity-30 font-bold uppercase tracking-widest text-left px-1">
             AutoDev Architect
          </div>
          <div className="text-[15px] leading-relaxed font-medium text-slate-200 whitespace-pre-wrap pl-1 border-l border-white/5">
            {cleanText}
          </div>
        </div>
      )}
    </div>
  );
}