import React, { useState, useEffect, useRef } from "react";
import PlanStatus from "../components/chat/PlanStatus"
// Hooks
import { useAI } from "../hooks/useAI";
import { useWebContainer } from "../hooks/useWebContainer";

// Utilities
import { ActionRunner } from "../utils/ActionRunner";
import { parseXml } from "../lib/fileParser";

// UI Components
import PreviewPanel from "../components/preview/PreviewPanel";
import ChatInput from "../components/chat/ChatInput";
import ChatMessage from "../components/chat/ChatMessage";
import { observer } from '../utils/SystemObserver';
import { compressLogs } from '../utils/LogCompressor';
import { AnimatePresence } from 'framer-motion';

export default function Workbench() {
  // =================================================================
  // ✅ HOOKS MUST BE IN FIXED ORDER (TOP OF COMPONENT)
  // =================================================================

  // 1. Custom Hooks First
  // Workbench.jsx ke top par hooks section mein:
  const { messages, sendMessage, isGenerating, setMessages, setIsGenerating } = useAI();
  const {
    webcontainer,
    currentUrl,
    logs,
    fileTree,
    refreshFileTree,
    addLog
  } = useWebContainer();

  // 2. ALL useState hooks together
  const [mode, setMode] = useState('chat');
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileContent, setActiveFileContent] = useState("");
  const [executionStatus, setExecutionStatus] = useState({
    plan: [],
    writingFiles: [],
    currentStep: 0
  });

  // 3. ALL useRef hooks together (BEFORE useEffect)
  const runnerRef = useRef(null);
  const processedMessages = useRef(new Set()); // ✅ MUST BE HERE
  const isBuilding = executionStatus.plan.length > 0 && executionStatus.currentStep < executionStatus.plan.length;

  // =================================================================
  // 4. useEffect hooks (AFTER all useState and useRef)
  // =================================================================

  // Effect 1: Initialize ActionRunner
  useEffect(() => {
    if (webcontainer && !runnerRef.current) {
      runnerRef.current = new ActionRunner(
        webcontainer,
        (data) => {
          addLog(data);
          // ✅ Yahan connected hona chahiye observer
          observer.reportTerminalError(data);
        },
        async () => { await refreshFileTree(); }
      );

      runnerRef.current.onProgress = (p) => {
        setExecutionStatus(prev => ({
          ...prev,
          writingFiles: p.type === 'writing' ? [...prev.writingFiles, p.fileName] : prev.writingFiles,
          currentStep: p.type === 'completed' ? prev.plan.length : prev.currentStep
        }));
      };
    }
  }, [webcontainer, addLog, refreshFileTree]);



  // Effect 2: Sync File Tree
  useEffect(() => {
    if (fileTree && Object.keys(fileTree).length > 0) {
      setFiles(fileTree);
    }
  }, [fileTree]);

  // Effect 3: Process AI Messages
  useEffect(() => {
    if (isGenerating || !runnerRef.current) return;

    const lastMsg = messages[messages.length - 1];

    if (
      !lastMsg ||
      lastMsg.role !== "assistant" ||
      processedMessages.current.has(lastMsg.content)
    ) {
      return;
    }


    const { files: parsedFiles, commands, plan: parsedPlan } = parseXml(lastMsg.content);

    const fileList = Object.keys(parsedFiles).map(filePath => ({
      path: filePath,
      content: parsedFiles[filePath].file?.contents ||
        parsedFiles[filePath].contents || ""
    }));

    if (fileList.length === 0 && commands.length === 0) return;

    processedMessages.current.add(lastMsg.content);

    addLog(`📦 System: Processing ${fileList.length} file(s) and ${commands.length} command(s)...`);

    setExecutionStatus({
      plan: parsedPlan || ["Analyzing", "Writing Code", "Syncing"],
      writingFiles: [],
      currentStep: 0
    });

    const executeAll = async () => {
      try {
        // Write files
        if (fileList.length > 0) {
          addLog("📝 System: Writing files to container...");
          await runnerRef.current.run(fileList, null);
          addLog("✅ System: Files written successfully!");
        }

        // Execute non-server commands
        const nonServerCommands = commands.filter(cmd =>
          !/dev|vite|serve|start/.test(cmd)
        );

        for (const cmd of nonServerCommands) {
          addLog(`⚙️ System: Executing: ${cmd}`);
          await runnerRef.current.run([], { type: 'shell', content: cmd });
        }

        // Start server commands
        const serverCommands = commands.filter(cmd =>
          /dev|vite|serve|start/.test(cmd)
        );

        for (const cmd of serverCommands) {
          addLog(`🚀 System: Starting server: ${cmd}`);
          runnerRef.current.run([], { type: 'shell', content: cmd });
        }

      } catch (err) {
        addLog(`❌ [ERROR]: ${err.message}`);
        console.error("Execution error:", err);
      }
    };

    executeAll();

  }, [messages, isGenerating, addLog]);

  // =================================================================
  // 5. Event Handlers (AFTER all hooks)
  // =================================================================

  const handleFileClick = async (filePath) => {
    setActiveFile(filePath);

    if (!webcontainer) {
      console.warn("WebContainer not ready");
      return;
    }

    try {
      // ✅ FIX: Path Clean karo (leading slash '/' hatao taaki WebContainer confuse na ho)
      const cleanPath = filePath.replace(/^\/+/, '');
      const content = await webcontainer.fs.readFile(cleanPath, 'utf-8');
      setActiveFileContent(content);
    } catch (error) {
      console.error("Error reading file:", error);
      setActiveFileContent(`// Error: Could not read file\n// ${error.message}`);
      addLog(`⚠️ Failed to read file: ${filePath}`);
    }
  };



  const handleSendMessage = async (userInput) => {
    if (!userInput.trim() || isGenerating) return;

    try {
      let finalPayload = userInput;

      // 🧠 SIRF BUILD MODE MEIN ERROR LOGS BHEJO
      if (mode === 'build') {
        const systemSnapshot = compressLogs(observer.logs.terminal, observer.logs.runtime);
        // Agar healthy hai toh kuch mat bhejo, sirf user request
        if (systemSnapshot) {
          finalPayload = `[SYSTEM_REPORT]\nDetected Issues:\n${systemSnapshot}\n\n[USER_REQUEST]\n${userInput}`;
        }
      }

      // useAI ko mode pass karo
      await sendMessage(finalPayload, mode);
      observer.clear();
    } catch (error) {
      console.error(error);
      // Sirf error aane par lock kholo warna useAI khud handle karega
      setIsGenerating(false);
    }
  };


  // =================================================================
  // 6. Render (ALWAYS LAST)
  // =================================================================

  // =================================================================
  // 6. Render (UPDATED)
  // =================================================================
  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-100 font-sans overflow-hidden">

      {/* LEFT PANEL: Chat Interface */}
      <div className="w-1/3 min-w-[350px] flex flex-col border-r border-gray-800 bg-gray-900 relative">

        {/* 1. Chat Message History */}
        {/* 🧠 SMART PADDING: Compact mode mein pb-56 kaafi hai, full mode mein pb-72 */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide transition-all duration-500 ${isBuilding ? 'pb-56' : 'pb-72'}`}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Start a conversation to build your app...
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                role={msg.role}
                content={msg.content}
              />
            ))
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <span>AI is generating code...</span>
            </div>
          )}
        </div>

        {/* 🚀 2. COMPACT DYNAMIC STATUS CARD */}
        {/* 🎯 isBuilding true hai toh bottom-[140px] aur scale-90 taaki chat na ruke */}
        <div
          className={`absolute left-0 right-0 px-6 z-20 pointer-events-none transition-all duration-500 ease-in-out ${isBuilding
              ? 'bottom-[140px] scale-90 origin-bottom'
              : 'bottom-[100px] scale-100 opacity-95'
            }`}
        >
          <div className="pointer-events-auto max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              {(mode === 'build' || executionStatus.plan.length > 0) && (
                <PlanStatus
                  plan={executionStatus.plan}
                  writingFiles={executionStatus.writingFiles}
                  currentStep={executionStatus.currentStep}
                  compact={isBuilding} // ✅ Pass compact prop for slim UI
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. Chat Input Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 z-30">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isGenerating}
            mode={mode}
            setMode={setMode}
          />
        </div>
      </div>

      {/* RIGHT PANEL: Preview & Code */}
      <div className="flex-1 flex flex-col bg-gray-950 relative">
        <PreviewPanel
          files={files}
          url={currentUrl}
          logs={logs}
          onFileClick={handleFileClick}
          activeFile={activeFile}
          activeFileContent={activeFileContent}
        />
      </div>

    </div>
  );
}