import { FileCode, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FileExplorer({ files, onSelect, selectedFile }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] text-slate-400">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Explorer
        </span>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {files && Object.keys(files).length > 0 ? (
          <FileTree 
            tree={files} 
            onSelect={onSelect} 
            selectedFile={selectedFile} 
            path="" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-20 text-xs text-slate-600 italic">
            <span>No files found</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ 1. Recursive Tree Component (Safe Version)
function FileTree({ tree, onSelect, selectedFile, path }) {
  // 🛡️ CRITICAL FIX: Safety Check against crash
  if (!tree || typeof tree !== 'object') return null;

  // Sorting: Folders Up, Files Down, Alphabetical
  const sortedEntries = Object.entries(tree).sort(([nameA, nodeA], [nameB, nodeB]) => {
    // Safety check for node structure
    const isDirA = nodeA && !!nodeA.directory;
    const isDirB = nodeB && !!nodeB.directory;
    
    if (isDirA && !isDirB) return -1; // Folder upar
    if (!isDirA && isDirB) return 1;  // File niche
    return nameA.localeCompare(nameB); // A-Z sorting
  });

  return (
    <div className="flex flex-col gap-0.5">
      {sortedEntries.map(([name, node]) => {
        const currentPath = path ? `${path}/${name}` : name;
        // Check if directory exists
        const isDirectory = node && !!node.directory;

        if (isDirectory) {
          return (
            <FolderNode 
              key={currentPath} 
              name={name} 
              node={node.directory} 
              onSelect={onSelect} 
              selectedFile={selectedFile} 
              path={currentPath}
            />
          );
        }

        return (
          <FileNode
            key={currentPath}
            name={name}
            path={currentPath}
            onSelect={onSelect}
            isSelected={selectedFile === currentPath}
          />
        );
      })}
    </div>
  );
}

// ✅ 2. Folder Component
function FolderNode({ name, node, onSelect, selectedFile, path }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 w-full px-2 py-1 text-xs hover:bg-white/5 hover:text-white transition-colors select-none group"
      >
        <span className="text-slate-600 group-hover:text-slate-400">
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        
        {isOpen ? (
          <FolderOpen size={14} className="text-blue-400/80" />
        ) : (
          <Folder size={14} className="text-blue-400/60" />
        )}
        
        <span className="font-medium truncate">{name}</span>
      </button>
      
      {isOpen && (
        <div className="pl-4 border-l border-white/5 ml-2.5">
          <FileTree 
            tree={node} 
            onSelect={onSelect} 
            selectedFile={selectedFile} 
            path={path} 
          />
        </div>
      )}
    </div>
  );
}

// ✅ 3. File Component
function FileNode({ name, path, onSelect, isSelected }) {
  const getIconColor = (filename) => {
    if (filename.endsWith('jsx') || filename.endsWith('tsx')) return "text-cyan-400";
    if (filename.endsWith('css')) return "text-pink-400";
    if (filename.endsWith('js') || filename.endsWith('ts')) return "text-yellow-400";
    if (filename.endsWith('json')) return "text-green-400";
    if (filename.endsWith('html')) return "text-orange-400";
    return "text-slate-400";
  };

  return (
    <button
      onClick={() => onSelect(path)}
      className={`flex items-center gap-2 w-full px-2 py-1 text-xs transition-colors select-none
        ${isSelected 
          ? "bg-blue-500/20 text-white border-l-2 border-blue-500" 
          : "text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
        }
      `}
    >
      <FileCode size={13} className={isSelected ? "text-blue-300" : getIconColor(name)} />
      <span className={`truncate ${isSelected ? "font-medium" : ""}`}>{name}</span>
    </button>
  );
}