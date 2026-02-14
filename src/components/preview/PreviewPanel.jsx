import { Code2, Monitor, TerminalSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import HtmlPreview from "./HtmlPreview";
import Welcome from "../layout/Welcome";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";

export default function PreviewPanel({ 
  files = {}, 
  url = null, 
  logs = [], 
  onFileClick,
  activeFile = null, 
  activeFileContent = ""
}) {
  const [activeTab, setActiveTab] = useState("preview");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const handleFileSelect = (path) => {
    if (onFileClick) onFileClick(path);
    setActiveTab("code");
  };

  return (
    <div className="h-full flex flex-col bg-transparent relative">
      
      {/* 🔹 HEADER BAR */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-white/5 backdrop-blur-md z-20">
        
        {/* TABS CONTROLLER */}
        <div className="flex bg-black/20 p-1 rounded-lg gap-1 border border-white/5">
          <button 
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "preview"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Monitor size={14} /> Preview
          </button>

          <button 
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "code"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code2 size={14} /> Code
          </button>
        </div>

        {/* STATUS & TERMINAL TOGGLE */}
        <div className="flex items-center gap-3">
          {url && activeTab === "preview" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                Live
              </span>
            </div>
          )}

          <button 
            onClick={() => setIsTerminalOpen(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isTerminalOpen
                ? "bg-white text-black border-white"
                : "bg-black/30 text-slate-400 border-white/10 hover:border-white/30"
            }`}
          >
            <TerminalSquare size={14} />
            Terminal
            {isTerminalOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>
      </div>

      {/* 🔹 MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative bg-slate-950/50 backdrop-blur-sm flex flex-col">
        
        <div className="flex-1 overflow-hidden relative">
          {activeTab === "preview" ? (
            <div className="h-full w-full bg-white">
              {!url ? (
                <Welcome />
              ) : (
                <HtmlPreview url={url} />
              )}
            </div>
          ) : (
            <div className="h-full w-full flex">
              <div className="w-60 border-r border-white/10 bg-black/20 shrink-0 flex flex-col">
                <FileExplorer 
                  files={files} 
                  onSelect={handleFileSelect} 
                  selectedFile={activeFile} 
                />
              </div>
              
              <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
                <CodeEditor 
                  file={activeFile} 
                  content={activeFileContent} 
                />
              </div>
            </div>
          )}
        </div>

        {/* 🔹 BOTTOM TERMINAL */}
        {isTerminalOpen && (
          <div className="h-48 shrink-0 border-t border-white/10 bg-black/80">
            <Terminal logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
}