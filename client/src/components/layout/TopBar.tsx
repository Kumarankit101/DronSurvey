import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to get the page title based on the current path
function getPageTitle(path: string): string {
  switch (path) {
    case "/":
      return "Dashboard";
    case "/missions":
      return "Mission Planning";
    case "/fleet":
      return "Fleet Management";
    case "/monitor":
      return "Mission Monitoring";
    case "/reports":
      return "Reports";
    case "/settings":
      return "Settings";
    case "/help":
      return "Help & Support";
    default:
      return "Drone Survey Management";
  }
}

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const pageTitle = getPageTitle(location);

  return (
    <header className="bg-white shadow-sm z-20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick} 
            className="md:hidden mr-4 text-gray-700 hover:text-gray-900"
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-xl font-medium">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-4">
            <span className="material-icons absolute top-2 left-2 text-gray-400">search</span>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="relative mr-2">
              <span className="material-icons text-gray-700">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-4 flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="User profile" 
                    />
                    <AvatarFallback>TA</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 font-medium text-sm hidden sm:block">Thomas Anderson</span>
                  <span className="material-icons text-gray-400">arrow_drop_down</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="material-icons mr-2 text-sm">person</span>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="material-icons mr-2 text-sm">settings</span>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="material-icons mr-2 text-sm">logout</span>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
