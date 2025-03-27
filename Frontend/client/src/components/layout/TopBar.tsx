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
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const pageTitle = getPageTitle(location);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear all queries from cache
      queryClient.clear();

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  // Sample notifications data - in a real app, this would come from an API or context
  const notifications = [
    {
      id: 1,
      title: "Mission Completed",
      message: "Survey mission #1234 has been completed",
      time: "10 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Drone Alert",
      message: "Drone DJI-001 battery level is below 20%",
      time: "30 min ago",
      read: false,
    },
    {
      id: 3,
      title: "New Report Available",
      message: "Survey report for Site A is ready to view",
      time: "2 hours ago",
      read: true,
    },
  ];

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
            <span className="material-icons absolute top-2 left-2 text-gray-400">
              search
            </span>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative mr-2">
                  <span className="material-icons text-gray-700">
                    notifications
                  </span>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Mark all as read
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <div
                        className={`w-full p-3 cursor-pointer ${
                          notification.read ? "" : "bg-blue-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">
                            {notification.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <Button variant="ghost" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="ml-4 flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="User profile"
                    />
                    <AvatarFallback>TA</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 font-medium text-sm hidden sm:block">
                    Ankit
                  </span>
                  <span className="material-icons text-gray-400">
                    arrow_drop_down
                  </span>
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
                <DropdownMenuItem onSelect={handleLogout}>
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
