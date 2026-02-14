import { useEffect, useState, useRef, useCallback } from "react";
import { getWebContainer } from "../lib/webcontainer";
import { FILES } from "../utils/filesMap";
import { observer } from "../utils/SystemObserver";

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  ".cache",
]);

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [logs, setLogs] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [bootError, setBootError] = useState(false);

  const isBooting = useRef(false);
  const activeProcess = useRef(null);

  /* -------------------- LOG HANDLER -------------------- */
  const addLog = useCallback((msg) => {
    setLogs((prev) => [...prev, msg].slice(-500));
  }, []);

  /* -------------------- FILE TREE (Lazy Read) -------------------- */
  const readFileTree = useCallback(async (instance, dir = "") => {
    const entries = await instance.fs.readdir(dir || "/", {
      withFileTypes: true,
    });
    const tree = {};
    for (const entry of entries) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      const path = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        tree[entry.name] = {
          directory: await readFileTree(instance, path),
        };
      } else {
        tree[entry.name] = { file: { path } };
      }
    }
    return tree;
  }, []);

  const refreshFileTree = useCallback(async () => {
    if (!webcontainer) return;
    try {
      const tree = await readFileTree(webcontainer);
      setFileTree(tree);
    } catch (err) {
      console.error("[FileSystem] Tree Sync Error", err);
    }
  }, [webcontainer, readFileTree]);

  /* -------------------- PROCESS STARTER (NATIVE PNPM TURBO) -------------------- */
 /* -------------------- PROCESS STARTER (SAFE & FAST) -------------------- */
  const startDevServer = useCallback(async (instance) => {
    try {
      const rootFiles = await instance.fs.readdir("/");
      const hasNodeModules = rootFiles.includes("node_modules");

      if (!hasNodeModules) {
        addLog("📦 [PROCESS] Installing dependencies (pnpm)...");

        // 1. Install Dependencies
        const installProcess = await instance.spawn("pnpm", [
          "install",
          "--shamefully-hoist",
          "--silent"
        ]);

        installProcess.output.pipeTo(
          new WritableStream({
            write: (data) => {
              if (data.includes('ERR') || data.includes('WARN')) addLog(data);
            },
          })
        );

        const exitCode = await installProcess.exit;

        if (exitCode !== 0) {
          addLog("❌ [ERROR] Dependency installation failed.");
          return;
        }
        addLog("✅ [SYSTEM] Dependencies locked!");
      }

      // 2. Start Server
      addLog("▶️ [PROCESS] Starting Dev Server...");
      const devProcess = await instance.spawn("pnpm", ["run", "dev"]);
      activeProcess.current = devProcess;

      devProcess.output.pipeTo(
        new WritableStream({
          write: (data) => {
             // Ye logs UI mein dikhana zaroori hai taaki pata chale server start hua
             if (data.includes('VITE') || data.includes('Local') || data.includes('ready')) {
               addLog(data);
             }
          }
        })
      );
    } catch (err) {
      addLog(`[PROCESS_ERROR]: ${err.message}`);
    }
  }, [addLog]);

  /* -------------------- MAIN BOOT EFFECT -------------------- */
  useEffect(() => {
    if (webcontainer || isBooting.current) return;
    isBooting.current = true;

    const boot = async () => {
      try {
        addLog("⚡ [SYSTEM] Booting WebContainer...");
        const instance = await getWebContainer();

        instance.on("server-ready", (_, url) => {
          addLog(`🌐 [SERVER] Live at: ${url}`);
          setCurrentUrl(url);
          setIsReady(true);
        });

        instance.on("error", (error) => {
          const errMsg = `CRASH: ${error.message}`;
          addLog(errMsg);
          observer?.reportRuntimeError?.(errMsg);
        });

        await instance.mount(FILES);
        setWebcontainer(instance);

        // 🚀 Parallel Execution
        startDevServer(instance); 
        
        // 🔥 CPU PRIORITY HACK
        setTimeout(() => {
          readFileTree(instance).then(tree => setFileTree(tree));
        }, 500);

      } catch (err) {
        setBootError(true);
        const crashLog = `[BOOT_FAILED]: ${err.message}`;
        addLog(crashLog);
        observer?.reportRuntimeError?.(crashLog);
      }
    };

    boot();

    return () => {
      if (activeProcess.current) {
        activeProcess.current.kill();
      }
    };
  }, [readFileTree, startDevServer, addLog, webcontainer]);

  return {
    webcontainer,
    currentUrl,
    logs,
    fileTree,
    refreshFileTree,
    addLog,
    isReady,
    bootError,
  };
}