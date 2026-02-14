export const FILES = {
  // ⚡ PNPM CONFIG (Speed + Compatibility)
  '.npmrc': {
    file: {
      contents: `
registry=https://registry.npmjs.org/
shamefully-hoist=true
strict-peer-dependencies=false
loglevel=warn
`
    }
  },

  // 📦 PACKAGE JSON
  'package.json': {
    file: {
      contents: JSON.stringify({
        name: "autodev-pnpm",
        type: "module",
        version: "2.0.0",
        scripts: {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        dependencies: {
          "react": "^18.3.1",
          "react-dom": "^18.3.1",
          "lucide-react": "^0.344.0",
          "framer-motion": "^11.0.8", 
          "clsx": "^2.1.1",
          "tailwind-merge": "^2.3.0"
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.3.1",
          "vite": "^5.4.2",
          "tailwindcss": "^3.4.10",
          "postcss": "^8.4.41",
          "autoprefixer": "^10.4.20"
        }
      }, null, 0)
    }
  },

  // ⚡ VITE CONFIG
  'vite.config.js': {
    file: {
      contents: `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: { clientPort: 443, overlay: false },
  },
  build: { target: 'esnext' }
});`
    }
  },

  'postcss.config.js': {
    file: { contents: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }` }
  },

  'tailwind.config.js': {
    file: { contents: `export default { content: ["./index.html", "./src/**/*.{js,jsx}"], theme: { extend: { colors: { background: '#09090b' } } }, plugins: [], }` }
  },

  'index.html': {
    file: { contents: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AutoDev</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>` }
  },

  'src': {
    directory: {
      'main.jsx': {
        file: { contents: `import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App.jsx'; import './index.css'; ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);` }
      },
      'index.css': {
        file: { contents: `@tailwind base; @tailwind components; @tailwind utilities; body { background-color: #09090b; color: white; }` }
      },
      'App.jsx': {
        file: { contents: `import React from 'react'; 
import { Loader2 } from 'lucide-react';
export default function App() { 
  return (
    <div className="h-screen w-full bg-[#09090b] text-white flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
        <h1 className="text-2xl font-bold tracking-tight">AutoDev Mark II</h1>
      </div>
      <p className="text-zinc-500 text-sm font-mono animate-pulse">Powered by pnpm 🚀</p>
    </div>
  ); 
}` }
      }
    }
  }
};