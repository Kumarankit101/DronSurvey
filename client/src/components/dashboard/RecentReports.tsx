import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SurveyReport } from "@shared/schema";
import { formatDistance } from "date-fns";

export default function RecentReports() {
  const { data: reports, isLoading } = useQuery<SurveyReport[]>({
    queryKey: ['/api/survey-reports'],
  });

  // Get recent reports, sorted by date
  const recentReports = reports 
    ? [...reports].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 3) 
    : [];

  // Dummy data for chart (since this would come from historical data aggregation)
  const chartData = [
    { day: 'Mon', current: 60, previous: 40 },
    { day: 'Tue', current: 45, previous: 35 },
    { day: 'Wed', current: 65, previous: 50 },
    { day: 'Thu', current: 85, previous: 60 },
    { day: 'Fri', current: 55, previous: 45 },
    { day: 'Sat', current: 30, previous: 25 },
    { day: 'Sun', current: 20, previous: 15 },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-4 border-b">
        <CardTitle className="text-lg">Recent Reports</CardTitle>
        <Button variant="ghost" size="sm">
          <span className="material-icons text-sm">more_horiz</span>
        </Button>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-md font-medium">Completed Surveys</h3>
            <p className="text-gray-500 text-sm">Last 7 days vs previous period</p>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-blue-600 rounded-sm mr-1"></span>
            <span className="text-xs text-gray-500 mr-3">Current</span>
            <span className="inline-block w-3 h-3 bg-gray-400 rounded-sm mr-1"></span>
            <span className="text-xs text-gray-500">Previous</span>
          </div>
        </div>
        
        <div className="h-40 flex items-end justify-between">
          {chartData.map((item) => (
            <div key={item.day} className="flex flex-col items-center">
              <div className="flex h-32 items-end">
                <div 
                  className="w-4 bg-gray-400 mx-1 rounded-t transition-all duration-500 ease-in-out" 
                  style={{ height: `${item.previous}%` }}
                ></div>
                <div 
                  className="w-4 bg-blue-600 mx-1 rounded-t transition-all duration-500 ease-in-out" 
                  style={{ height: `${item.current}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">{item.day}</div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 mt-6 pt-4">
          <h3 className="text-md font-medium mb-3">Recent Reports</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-3 flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-icons text-blue-600">description</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{`Mission #${report.missionId} Report`}</h4>
                      <span className="text-xs text-gray-500">
                        {formatDistance(new Date(report.date), new Date(), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {report.duration} min survey • {report.areaCovered}km² covered
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button variant="outline" className="w-full mt-4">
            <span className="material-icons text-sm mr-1">assessment</span>
            View All Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
