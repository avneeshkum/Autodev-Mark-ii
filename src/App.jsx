import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar"; 
import Home from "./pages/Home";
import Workbench from "./pages/Workbench";

export default function App() {
  return (
    // 👇 Yahan changes kiye hain tumhare CSS ke hisaab se
    <div className="studio-container mesh-bg text-slate-900">
      
      {/* Global Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div className="relative z-10 h-full w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Workbench />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}