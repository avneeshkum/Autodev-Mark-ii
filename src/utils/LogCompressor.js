// src/utils/LogCompressor.js
export const compressLogs = (terminalLogs, runtimeLogs) => {
  let report = "";

  // 1. Terminal Filter: Sirf 'Error' ya 'Fail' wali lines uthao
  const criticalTerminal = terminalLogs
    .filter(log => /error|failed|exception|not found/gi.test(log.msg))
    .slice(-2); // Sirf aakhri 2 errors

  if (criticalTerminal.length > 0) {
    report += "TERMINAL_ERRORS:\n" + criticalTerminal.map(l => `- ${l.msg}`).join('\n');
  }

  // 2. Runtime Filter: Browser console errors ko chota karo
  if (runtimeLogs.length > 0) {
    const lastError = runtimeLogs[runtimeLogs.length - 1];
    // Chota snippet: "ReferenceError: x is not defined at App.jsx:10"
    report += `\nRUNTIME_CRASH: ${lastError.toString().substring(0, 150)}`;
  }

  // 3. Tokens Check: Agar report 200 characters se badi hai, toh trim karo
  return report.substring(0, 300) || null; 
};