import StatsSummary from "@/components/dashboard/StatsSummary";
import MissionOverview from "@/components/dashboard/MissionOverview";
import FleetStatus from "@/components/dashboard/FleetStatus";
import RecentReports from "@/components/dashboard/RecentReports";
import ChatBot from "@/components/chatbot/ChatBot";


export default function Dashboard() {
  return (
    <div className="px-6 py-6">
      {/* Quick Stats Cards */}
      <StatsSummary />

      {/* Mission Monitoring Section */}
      <MissionOverview />

      {/* Fleet Status and Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FleetStatus />
        <RecentReports />
      </div>
      <ChatBot />
    </div>
  );
}
