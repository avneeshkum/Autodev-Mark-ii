// src/utils/SystemObserver.js

class SystemObserver {
  constructor() {
    this.logs = {
      terminal: [], // Runtime/Vite errors
      files: [],    // Write/Write-access errors
      runtime: []   // Iframe/Browser console errors
    };
  }

  // 🛡️ 1. Terminal se error capture karo (Vite/Node logs)
  reportTerminalError(data) {
    // Sirf wahi lines pakdo jisme gadbad ho
    if (/error|failed|exception|typeerror|not found/gi.test(data)) {
      this.logs.terminal.push({ 
        time: new Date().toLocaleTimeString(), 
        msg: data.trim() 
      });
      // Memory saaf rakhne ke liye sirf aakhri 10 errors rakho
      if (this.logs.terminal.length > 10) this.logs.terminal.shift();
    }
  }

  // 🛡️ 2. File write fail hone par (ActionRunner logic)
  reportFileError(fileName, error) {
    this.logs.files.push({ 
      file: fileName, 
      error: typeof error === 'string' ? error : error.message 
    });
  }

  // 🛡️ 3. Iframe (Browser) crash hone par (HtmlPreview logic)
  reportRuntimeError(errorMsg) {
    this.logs.runtime.push(errorMsg);
    if (this.logs.runtime.length > 5) this.logs.runtime.shift();
  }

  // 🧹 Bhejne ke baad saaf karne ke liye
  clear() {
    this.logs = { terminal: [], files: [], runtime: [] };
  }
}

export const observer = new SystemObserver();