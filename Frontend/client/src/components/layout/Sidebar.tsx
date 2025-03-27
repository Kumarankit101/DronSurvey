import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Navigation item type
type NavItem = {
  name: string;
  path: string;
  icon: string;
};

// Main navigation items
const mainNavItems: NavItem[] = [
  { name: "Dashboard", path: "/", icon: "dashboard" },
  { name: "Mission Planning", path: "/missions", icon: "flight_takeoff" },
  { name: "Fleet Management", path: "/fleet", icon: "devices" },
  { name: "Mission Monitoring", path: "/monitor", icon: "gps_fixed" },
  { name: "Facility Management", path: "/facilities", icon: "business" },
  { name: "Reports", path: "/reports", icon: "assessment" },
];

// Secondary navigation items
const secondaryNavItems: NavItem[] = [
  { name: "Settings", path: "/settings", icon: "settings" },
  { name: "Help & Support", path: "/help", icon: "help" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "bg-white w-64 h-full fixed left-0 top-0 transform z-40 transition-transform duration-300 shadow-lg",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-4 py-6">
          {/* Logo area */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <span className="material-icons text-primary mr-2">flight</span>
              <span className="text-xl font-medium text-primary">
                DroneSurvey
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Main navigation */}
          <nav>
            <ul>
              {mainNavItems.map((item) => (
                <li key={item.path} className="mb-1">
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg",
                      location === item.path
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Secondary navigation */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <ul>
              {secondaryNavItems.map((item) => (
                <li key={item.path} className="mb-1">
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg",
                      location === item.path
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
