import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  activeMissions: number;
  availableDrones: number;
  completedSurveys: number;
  areaCovered: string;
}

export default function StatsSummary() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });
  
  const stats = [
    {
      title: "Active Missions",
      value: data?.activeMissions || 0,
      change: "+12% from last week",
      changeType: "positive",
      icon: "flight",
      iconBg: "bg-primary-light bg-opacity-20",
      iconColor: "text-primary",
    },
    {
      title: "Available Drones",
      value: data?.availableDrones || 0,
      change: "3 added this month",
      changeType: "positive",
      icon: "devices",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Surveys Completed",
      value: data?.completedSurveys || 0,
      change: "+8% from last month",
      changeType: "positive",
      icon: "assessment",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Area Covered",
      value: data ? `${data.areaCovered}km²` : "0km²",
      change: "5% weather delays",
      changeType: "negative",
      icon: "explore",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  if (error) {
    return (
      <div className="mb-8 text-center py-4">
        <p className="text-red-600">Failed to load dashboard stats</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-3xl font-medium">{stat.value}</h3>
                )}
                <p className={`text-sm flex items-center mt-2 ${
                  stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                }`}>
                  <span className="material-icons text-sm">
                    {stat.changeType === "positive" ? "arrow_upward" : "arrow_downward"}
                  </span>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                <span className={`material-icons ${stat.iconColor}`}>{stat.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
