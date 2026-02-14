import { useNavigate } from "react-router-dom";
import ChatInput from "../components/chat/ChatInput"; 

export default function Home() {
  const navigate = useNavigate();

  // FIX: Ab hum 'input' state yahan nahi banayenge.
  // Data seedha ChatInput se aayega (text argument ke roop mein).
  const handleStartChat = (text, mode) => {
    if (text && text.trim()) {
      navigate("/chat", { 
        state: { 
          initialMsg: text,
          initialMode: mode // Build/Chat mode bhi pass kar rahe hain
        } 
      });
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 transition-all">
      <h1 className="text-5xl font-italic text-slate-900 mb-10 tracking-tight">
        What will we build today?
      </h1>
      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* FIX: 'value' aur 'onChange' hata diya kyunki ChatInput ab internal state use karta hai */}
        <ChatInput 
          onSend={handleStartChat} 
          placeholder="Type your idea and press Enter..." 
        />
      </div>
    </div>
  );
}