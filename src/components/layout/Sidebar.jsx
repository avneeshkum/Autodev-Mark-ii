import { useState, useEffect } from "react";
import { Plus, Zap, MessageSquare, PanelLeftClose, PanelLeftOpen, Key, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();

  // ✅ Page load hote hi saved key uthao
  useEffect(() => {
    const savedKey = localStorage.getItem("mistral_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  // ✅ Key save karne ka function
  const saveKey = () => {
    localStorage.setItem("mistral_api_key", apiKey);
    // Workbench ko batane ke liye storage event trigger karo
    window.dispatchEvent(new Event("storage"));
    alert("API Key Saved! ✅");
  };

  return (
    <div className={`${isOpen ? "w-72" : "w-20"} h-screen bg-white border-r border-gray-100 flex flex-col p-4 transition-all duration-300 ease-in-out z-50`}>
      
      {/* HEADER & TOGGLE */}
      <div className="flex items-center justify-between mb-8 px-2">
        {isOpen && (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AutoDev</span>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-gray-100 rounded-lg text-slate-500 transition-colors"
        >
          {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>
      
      {/* NEW CHAT BUTTON */}
      <button 
        onClick={() => navigate("/")}
        className={`flex items-center gap-3 p-3 mb-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all ${!isOpen && "justify-center"}`}
      >
        <Plus size={20} className="text-slate-600" />
        {isOpen && <span className="font-medium text-slate-700">New Chat</span>}
      </button>

      {/* RECENT LIST */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {isOpen && <p className="text-[11px] font-bold text-slate-400 px-3 mb-2 uppercase">Recent</p>}
        <div className={`flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer ${!isOpen && "justify-center"}`}>
          <MessageSquare size={18} />
          {isOpen && <span className="text-sm truncate">My New Project...</span>}
        </div>
      </div>

      {/* ✅ API KEY SETTINGS SECTION (Niche fix rahega) */}
      {isOpen ? (
        <div className="mt-auto border-t border-gray-100 pt-6 pb-2">
          <p className="text-[10px] font-bold text-slate-400 px-3 mb-3 uppercase tracking-wider">Settings</p>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Key size={14} className="text-blue-500" />
              <span className="text-[11px] font-bold text-slate-600">Mistral API Key</span>
            </div>
            <div className="flex flex-col gap-2">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste key here..."
                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-blue-400 transition-all text-slate-700"
              />
              <button 
                onClick={saveKey}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Save size={12} /> Save Settings
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto flex justify-center pb-4">
           <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
              <Key size={20} />
           </div>
        </div>
      )}
    </div>
  );
}