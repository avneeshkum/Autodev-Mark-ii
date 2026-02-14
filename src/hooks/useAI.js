import { useState, useCallback } from 'react';
import { SYSTEM_PROMPT, CHAT_PROMPT } from '../lib/constants';

// Helper: API Key ko saaf karne ke liye
const sanitizeKey = (str) => {
  if (!str) return "";
  return str.replace(/[^\x00-\x7F]/g, "").trim();
};

export function useAI() {
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const sendMessage = useCallback(async (prompt, mode = 'chat') => {
    const rawKey = import.meta.env.VITE_API_KEY;
    if (!rawKey) {
      alert("Error: API Key not found in .env file");
      return;
    }

    const apiKey = sanitizeKey(rawKey);

    // 1. UI Update: Sabse pehle user ka message screen par dikhao
    const newUserMsg = { role: "user", content: prompt };
    setMessages(prev => [...prev, newUserMsg]);
    
    // 2. Loading ON karo
    setIsGenerating(true);

    try {
      // 🎯 WIRING STEP: Sahi Prompt chunno mode ke hisaab se
      const activeSystemPrompt = mode === 'build' ? SYSTEM_PROMPT : CHAT_PROMPT;
      
      // Context taiyar karo (Last 10 messages)
      // Hum state ka snapshot le rahe hain newUserMsg ke saath
      let historyWindow = [...messages, newUserMsg].slice(-10);

      // 🛡️ DANDA LOGIC: XML instruction SIRF tab do jab mode 'build' ho
      if (mode === 'build' && historyWindow.length > 0) {
        const lastIdx = historyWindow.length - 1;
        // Last message ki copy banake instruction chipkao (Sirf API ke liye)
        historyWindow[lastIdx] = {
          ...historyWindow[lastIdx],
          content: historyWindow[lastIdx].content + "\n\n(IMPORTANT: Use <plan> and <autodevArtifact> structure. This is a BUILD request.)"
        };
      }

      // 3. Mistral API Call
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: "codestral-latest", 
          messages: [
            { role: "system", content: activeSystemPrompt }, 
            ...historyWindow
          ],
          temperature: 0,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to connect to AI");
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // 4. Success: AI ka reply chat mein add karo
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);

    } catch (err) {
      console.error("AutoDev AI Error:", err);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `⚠️ Error: ${err.message}. Please check your connection.` 
      }]);
    } finally {
      // 5. Loading OFF karo
      setIsGenerating(false);
    }
  }, [messages]); // Messages dependency zaroori hai context sync ke liye

  return { 
    messages, 
    sendMessage, 
    isGenerating, 
    setMessages, 
    setIsGenerating 
  };
}