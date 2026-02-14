import { observer } from './SystemObserver';

export class ActionRunner {
  constructor(webcontainerInstance, onLogCallback, onFileUpdate) {
    this.webcontainer = webcontainerInstance;
    this.onLog = onLogCallback;
    this.onFileUpdate = onFileUpdate;
    this.onProgress = null; // UI Progress Callback

    // 🧠 Memory: Track active processes
    this.activeProcesses = new Map();

    // 🛡️ Execution Queue: Prevents race conditions
    this.queue = Promise.resolve();

    // 📊 Stats tracking
    this.stats = {
      filesWritten: 0,
      commandsExecuted: 0,
      errors: 0
    };

    this.log("✅ ActionRunner: Rocket Engine Online. 🚀");
  }

  // 📝 Helper: Send messages to terminal
  log(msg) {
    if (this.onLog) {
      const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
      this.onLog(message);
    }
  }

  /**
   * Main Entry Point
   * Orchestrates files and commands
   */
  async run(files, commandAction) {
    if (!this.webcontainer) {
      this.log("⚠️ WebContainer not initialized!");
      return;
    }

    // 🛡️ Queue Chaining: Sequential execution (Never break the chain)
    this.queue = this.queue.then(async () => {

      // STEP 1: Write files first (ALWAYS!)
      if (files && files.length > 0) {
        await this.syncFiles(files);

        // ✅ UI Refresh: Sirf tab update karo jab files change hon
        if (this.onFileUpdate) {
          try {
            await this.onFileUpdate();
          } catch (err) {
            console.error("Tree refresh failed", err);
          }
        }
      }

      // STEP 2: Execute commands
      if (commandAction && commandAction.type === "shell") {
        const cmd = commandAction.content.trim();
        if (cmd) {
          await this.handleCommand(cmd);
        }
      }

    }).catch((err) => {
      this.stats.errors++;
      this.log(`❌ Runner Error: ${err.message}`);
    });

    return this.queue;
  }

  /**
   * 📂 Sync Files (Optimized with Agent Feedback)
   */
  async syncFiles(files) {
    // 🛡️ 1. Security: Critical Configs protect karo
    const forbiddenFiles = [
      'vite.config.js',
      'package.json',
      'postcss.config.js'
    ];

    const safeFiles = files.filter(f =>
      !forbiddenFiles.some(forbidden => f.path.includes(forbidden))
    );

    if (safeFiles.length === 0) return;

    // 🚀 2. SEQUENCE GUARD: Files ko sort karo
    const sortedFiles = [...safeFiles].sort((a, b) => {
      const isAppA = a.path.toLowerCase().endsWith('app.jsx');
      const isAppB = b.path.toLowerCase().endsWith('app.jsx');
      if (isAppA && !isAppB) return 1;
      if (!isAppA && isAppB) return -1;
      return 0;
    });

    this.log(`📝 Writing ${sortedFiles.length} file(s) in safe sequence...`);

    // 3. Directory Structure Prepare karo
    const dirsToCreate = new Set();
    const preparedFiles = sortedFiles.map(f => {
      const cleanPath = f.path.replace(/^\/+/, '').replace(/\.\.\//g, '').replace(/\/\//g, '/');
      const parts = cleanPath.split("/");
      if (parts.length > 1) dirsToCreate.add(parts.slice(0, -1).join("/"));
      return { cleanPath, content: f.content || '' };
    });

    // 4. Dirs banao (Recursive true ke saath)
    const sortedDirs = [...dirsToCreate].sort((a, b) => a.length - b.length);
    for (const dir of sortedDirs) {
      try {
        await this.webcontainer.fs.mkdir(dir, { recursive: true });
      } catch (err) {
        if (!err.message.includes('EEXIST')) console.error(err);
      }
    }

    // 5. ⚡ STABLE SEQUENTIAL WRITES WITH UI PROGRESS & AGENT FEEDBACK
    for (const file of preparedFiles) {
      try {
        // 📢 UI Progress Signal
        if (this.onProgress) {
          const progress = Math.round((this.stats.filesWritten / preparedFiles.length) * 100);
          this.onProgress({
            type: 'writing',
            fileName: file.cleanPath,
            progress: progress
          });
        }

        // 💾 Actual Write Operation
        await this.webcontainer.fs.writeFile(file.cleanPath, file.content);
        this.stats.filesWritten++;

      } catch (err) {
        this.log(`❌ Write Failed: ${file.cleanPath}`);
        this.stats.errors++;

        // 🔥 Agent ko failure report karo
        if (typeof observer !== 'undefined') {
          observer.reportFileError(file.cleanPath, err.message || "Disk write failure");
        }
      }
    }

    // 🔥 Loop ke BAHAR delay dalo
    await new Promise(resolve => setTimeout(resolve, 50));

    // 📢 Finish signal bhejo UI ko
    if (this.onProgress) {
      this.onProgress({ type: 'completed', progress: 100 });
    }

    this.log(`✅ Files updated sequence-safely`);
  }

  /**
   * 🎮 Smart Command Handler
   * Prevent redundant server restarts to keep HMR active
   */
  async handleCommand(cmd) {
    const isServerCmd = /dev|vite|serve|watch|start/.test(cmd);

    // 🚀 ROCKET LOGIC: HMR bachaane ke liye redundant restarts block karo
    if (isServerCmd) {
      const hasActiveDevServer = [...this.activeProcesses.keys()].some(active =>
        /dev|vite|serve|start/.test(active)
      );

      if (hasActiveDevServer) {
        this.log(`⚡ Dev server already active. Skipping restart to preserve HMR.`);
        return 0; // Skip silent rakho
      }

      // Background execution for servers (No blocking)
      return this.runCommand(cmd, false);
    }

    // Normal commands (npm install, mkdir, etc.) - Sequential blocking
    return this.runCommand(cmd, true);
  }

  /**
   * 🐚 Core Command Executor with Intelligence Bridge
   */
  async runCommand(command, shouldWait) {
    this.log(`🚀 Executing: ${command}`);

    try {
      const process = await this.webcontainer.spawn("jsh", ["-c", command]);
      this.activeProcesses.set(command, process);

      // 📝 STREAM OUTPUT: Connect to UI & Observer
      process.output.pipeTo(new WritableStream({
        write: (data) => {
          if (this.onLog) {
            this.onLog(data);
            // ✅ AGENT FEEDBACK: Terminal logs observer ko bhejo
            if (typeof observer !== 'undefined') {
              observer.reportTerminalError(data);
            }
          }
        }
      })).catch(() => { });

      if (shouldWait) {
        const exitCode = await process.exit;
        this.activeProcesses.delete(command);

        if (exitCode !== 0) {
          const errorMsg = `Command [${command}] failed with exit code ${exitCode}`;
          this.log(`⚠️ ${errorMsg}`);
          this.stats.errors++;
          
          // 🛡️ Agent ko failure report karo
          if (typeof observer !== 'undefined') {
            observer.reportTerminalError(`EXECUTION_FAILURE: ${errorMsg}`);
          }
        }
        return exitCode;
      } else {
        // Server processes handling
        process.exit.then(() => this.activeProcesses.delete(command));
        return 0;
      }

    } catch (error) {
      const crashMsg = `Critical Exec Error: ${error.message}`;
      this.log(`❌ ${crashMsg}`);
      
      // 🛡️ Report crash to Observer
      if (typeof observer !== 'undefined') {
        observer.reportTerminalError(crashMsg);
      }
      return 1;
    }
  }
}