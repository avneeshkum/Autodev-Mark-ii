import { useState } from "react";
import { MessageSquare, Hammer, ArrowUp } from "lucide-react";

export default function ChatInput({ onSend, placeholder, disabled, mode, setMode }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text, mode); 
      setText(""); 
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Page reload rokne ke liye
      handleSend();
    }
  };

  return (
    // ✅ DESIGN 100% SAME: Wahi White Box, Shadow aur Borders
    <div className="flex items-center w-full max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-white/20 p-2 gap-2">
      
      <input
        className="flex-1 bg-transparent outline-none py-2 px-3 text-slate-900 placeholder-slate-400 font-medium min-w-0"
        placeholder={placeholder || (mode === "build" ? "Describe app to build..." : "Ask AutoDev anything...")}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="flex items-center gap-2 shrink-0">
        
        {/* Chat Mode Button */}
        <button 
          type="button"
          onClick={() => setMode("chat")}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium border
            ${mode === "chat" 
              ? "bg-slate-200 text-slate-800 border-slate-300" 
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"} 
          `}
        >
          <MessageSquare size={16} />
          <span className="hidden sm:inline text-xs">Chat</span>
        </button>

        {/* Build Mode Button (Gradient intact) */}
        <button 
          type="button"
          onClick={() => setMode("build")}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-sm font-bold border
            ${mode === "build" ? "ring-2 ring-offset-1 ring-purple-500 scale-[1.02]" : "opacity-90"} 
            bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white 
            hover:opacity-100 hover:shadow-md border-white/20`}
        >
          <Hammer size={16} className="text-white" />
          <span className="hidden sm:inline text-xs">Build</span>
        </button>
        
        {/* Send Button */}
        <button 
          type="button"
          onClick={handleSend}
          disabled={text.trim().length === 0 || disabled}
          className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md flex items-center justify-center active:scale-90"
        >
          <ArrowUp size={18} />
        </button>
      </div>

    </div>
  );
}