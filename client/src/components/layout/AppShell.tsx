import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen md:ml-64 overflow-hidden">
        {/* Top Bar */}
        <TopBar onMenuClick={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-10 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
