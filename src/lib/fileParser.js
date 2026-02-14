/**
 * 🎯 parseXml
 * AI ke response se saare <autodevAction> tags nikaalta hai.
 * Ye global hai, matlab tags kahin bhi hon (inside or outside artifacts), 
 * ye unhe sahi se pakad lega.
 */
export function parseXml(content) {
  const files = {};
  const commands = [];

  // Regex breakdown:
  // 1. type="([^"]+)" -> type pakadta hai (file ya shell)
  // 2. (?: filePath="([^"]+)")? -> filePath pakadta hai agar hai toh (sirf files ke liye)
  // 3. ([\s\S]*?) -> Tags ke beech ka saara content (code ya command)
  const actionRegex = /<autodevAction\s+type="([^"]+)"(?:\s+filePath="([^"]+)")?[^>]*>([\s\S]*?)<\/autodevAction>/g;

  let match;

  // Poore content ko scan karo
  while ((match = actionRegex.exec(content)) !== null) {
    const type = match[1];           // 'file' ya 'shell'
    const filePath = match[2];       // Path (e.g., 'src/App.jsx')
    const rawContent = match[3];     // Actual content
    const cleanContent = rawContent.trim();

    if (type === "file" && filePath) {
      // File object taiyar karo jo ActionRunner ke liye compatible ho
      files[filePath] = {
        file: {
          contents: cleanContent
        }
      };
    } else if (type === "shell") {
      // Command ko simple array mein daalo
      commands.push(cleanContent);
    }
  }

  // Final extracted data return karo
  return { files, commands };
}