/**
 * 🧹 LogCleaner: The "Vision" of AutoDev
 * - Removes ANSI colors (garbage characters)
 * - Filters out noise (download bars, info messages)
 * - Keeps CRITICAL info (Errors, Warnings, File Paths)
 */
export const cleanLogs = (rawLogs) => {
  if (!rawLogs) return "";

  // 0. ANSI Color Codes Hatao (Sabse Pehle) 🎨 -> ⬜
  // Agar ye nahi hataya, toh Agent '[32mSuccess' ko dekh kar confuse ho jayega.
  const cleanText = rawLogs.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );

  // 1. Logs ko lines mein todo
  const lines = cleanText.split('\n');

  // 2. Smart Filter (Noise Reduction) 🔇
  const filteredLines = lines.filter(line => {
    const text = line.trim();
    if (!text) return false; // Khali line hatao
    
    // In words wale lines ko ignore maaro (Ye sab noise hai)
    const ignoreKeywords = [
      "Download", "Fetch", "Progress", "info Visit", 
      "=====", "⠁", "⠂", "⠄", "⡀", "⢀", // Loading animations
      "audit",       // NPM audit logs (noise)
      "fsevents",    // Mac/Linux warnings (irrelevant for web)
      "up to date",  // Yarn success msg
      "$ vite",      // Command echo
      "hmr update",  // Hot Module Replacement logs
      "page reload"
    ];

    // 🔥 CHANGE: Maine yahan se 'warn' aur 'node_modules' hata diya hai.
    // Ab Agent ko "Module not found" aur "Deprecation Warning" dikhega.
    
    // Agar line mein inme se kuch bhi hai, toh hata do
    return !ignoreKeywords.some(keyword => text.includes(keyword));
  });

  // 3. Critical Context Extraction 🧠
  // Hum last ki 50 lines lenge taaki context poora mile
  let errorSnippet = filteredLines.slice(-50).join('\n');

  // 4. Hard Limit (Token Saver) 🛡️
  // Agar phir bhi log bada hai, toh sirf last 1500 characters bhejo.
  // Ye Agent ke context window ko full hone se bachayega.
  if (errorSnippet.length > 1500) {
    errorSnippet = "...(logs truncated)...\n" + errorSnippet.slice(-1500);
  }

  return errorSnippet;
};