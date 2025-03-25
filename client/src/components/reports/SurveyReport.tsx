import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SurveyReport as SurveyReportType, Mission } from "@shared/schema";
import { format } from "date-fns";

// Chart-related imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function SurveyReport() {
  const [selectedReport, setSelectedReport] = useState<SurveyReportType | null>(null);
  const [reportDetailsOpen, setReportDetailsOpen] = useState(false);
  
  const { data: reports, isLoading: reportsLoading } = useQuery<SurveyReportType[]>({
    queryKey: ['/api/survey-reports'],
  });
  
  const { data: missions, isLoading: missionsLoading } = useQuery<Mission[]>({
    queryKey: ['/api/missions'],
  });

  // Function to get mission name from mission ID
  const getMissionName = (missionId: number) => {
    const mission = missions?.find(m => m.id === missionId);
    return mission ? mission.name : `Mission #${missionId}`;
  };

  // Open report details
  const openReportDetails = (report: SurveyReportType) => {
    setSelectedReport(report);
    setReportDetailsOpen(true);
  };

  // Format date for display
  const formatReportDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Prepare summary data for charts
  const prepareSummaryData = () => {
    if (!reports || reports.length === 0) return null;
    
    // Mission type count
    const missionCounts = missions?.reduce((acc: any, mission) => {
      const type = mission.missionType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const missionTypesData = Object.keys(missionCounts || {}).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: missionCounts?.[type]
    }));
    
    // Area covered by month
    const areaCoveredByMonth: any = {};
    
    reports.forEach(report => {
      const date = new Date(report.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const area = parseFloat(report.areaCovered || '0');
      
      areaCoveredByMonth[monthKey] = (areaCoveredByMonth[monthKey] || 0) + area;
    });
    
    const areaCoveredData = Object.keys(areaCoveredByMonth).map(month => {
      const [year, monthNum] = month.split('-');
      return {
        month: format(new Date(parseInt(year), parseInt(monthNum) - 1), 'MMM yyyy'),
        areaCovered: areaCoveredByMonth[month].toFixed(1)
      };
    }).sort((a, b) => {
      // Sort by date
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
    
    return {
      missionTypesData,
      areaCoveredData
    };
  };

  const summaryData = prepareSummaryData();
  
  // Colors for pie chart
  const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#9c27b0'];

  return (
    <>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Report List</TabsTrigger>
          <TabsTrigger value="summary">Summary Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card className="shadow-sm">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="text-xl">Survey Reports</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              {reportsLoading || missionsLoading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Date</TableHead>
                        <TableHead>Mission</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Area Covered</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                            No survey reports available
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports?.map((report) => (
                          <TableRow key={report.id} className="hover:bg-gray-50">
                            <TableCell>{formatReportDate(report.date)}</TableCell>
                            <TableCell className="font-medium">{getMissionName(report.missionId)}</TableCell>
                            <TableCell>{report.duration} minutes</TableCell>
                            <TableCell>{report.areaCovered} km²</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${
                                  report.status === 'completed'
                                    ? 'bg-green-100 text-green-800 border-green-300'
                                    : report.status === 'partial'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-red-100 text-red-800 border-red-300'
                                }`}
                              >
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openReportDetails(report)}
                              >
                                <span className="material-icons text-sm mr-1">visibility</span>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="text-lg">Area Covered Over Time</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {reportsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={summaryData?.areaCoveredData || []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis label={{ value: 'Area (km²)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="areaCovered" name="Area Covered (km²)" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="text-lg">Mission Types Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {missionsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={summaryData?.missionTypesData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {summaryData?.missionTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm lg:col-span-2">
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="text-lg">Survey Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Total Surveys</div>
                    <div className="text-3xl font-medium">{reports?.length || 0}</div>
                    <div className="text-gray-400 text-sm mt-2">All time</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Total Area</div>
                    <div className="text-3xl font-medium">
                      {reports?.reduce((sum, report) => sum + parseFloat(report.areaCovered || '0'), 0).toFixed(1)} km²
                    </div>
                    <div className="text-gray-400 text-sm mt-2">All time</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Avg Duration</div>
                    <div className="text-3xl font-medium">
                      {reports && reports.length > 0
                        ? Math.round(reports.reduce((sum, report) => sum + report.duration, 0) / reports.length)
                        : 0} min
                    </div>
                    <div className="text-gray-400 text-sm mt-2">Per survey</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Completion Rate</div>
                    <div className="text-3xl font-medium">
                      {reports && reports.length > 0
                        ? Math.round((reports.filter(r => r.status === 'completed').length / reports.length) * 100)
                        : 0}%
                    </div>
                    <div className="text-gray-400 text-sm mt-2">Success rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Report Details Dialog */}
      <Dialog open={reportDetailsOpen} onOpenChange={setReportDetailsOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Survey Report Details</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-medium">{getMissionName(selectedReport.missionId)}</h2>
                  <p className="text-gray-500">
                    {formatReportDate(selectedReport.date)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    selectedReport.status === 'completed'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : selectedReport.status === 'partial'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <div className="text-gray-500 text-sm mb-1">Duration</div>
                  <div className="text-xl font-medium">{selectedReport.duration} min</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <div className="text-gray-500 text-sm mb-1">Area Covered</div>
                  <div className="text-xl font-medium">{selectedReport.areaCovered} km²</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <div className="text-gray-500 text-sm mb-1">Mission ID</div>
                  <div className="text-xl font-medium">#{selectedReport.missionId}</div>
                </div>
              </div>
              
              <div className="pt-2">
                <h3 className="font-medium mb-2">Summary</h3>
                <p className="text-gray-700">{selectedReport.summary || "No summary provided."}</p>
              </div>
              
              {selectedReport.findings && (
                <div className="pt-2">
                  <h3 className="font-medium mb-2">Findings</h3>
                  {selectedReport.findings.issues && selectedReport.findings.issues.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Issues Identified:</h4>
                      <ul className="list-disc pl-5 text-gray-700">
                        {(selectedReport.findings.issues as string[]).map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500">No issues reported.</p>
                  )}
                  
                  {selectedReport.findings.progress && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700">Progress Notes:</h4>
                      <p className="text-gray-700">{selectedReport.findings.progress}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end mt-4 pt-2 border-t border-gray-100">
                <Button variant="outline" className="mr-2">
                  <span className="material-icons text-sm mr-1">file_download</span>
                  Download
                </Button>
                <Button onClick={() => setReportDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
