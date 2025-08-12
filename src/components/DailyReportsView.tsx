
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useDailyReports } from '@/hooks/useDailyReports';

const DailyReportsView = () => {
  const { reports, loading, generateDailyReport } = useDailyReports();

  const getProductivityColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading reports...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daily Reports</h2>
        <Button onClick={() => generateDailyReport()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Generate Today's Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No reports available</p>
              <p className="text-sm text-muted-foreground">Start tracking time to generate reports</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {new Date(report.date).toLocaleDateString()}
                  </CardTitle>
                  <Badge className={`${getProductivityColor(report.productivity_percentage)} text-white`}>
                    {report.productivity_percentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium">Productive</span>
                    </div>
                    <div className="text-lg font-bold">{report.total_productive_hours}h</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-red-600">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">Unproductive</span>
                    </div>
                    <div className="text-lg font-bold">{report.total_unproductive_hours}h</div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Active:</span>
                    <span className="font-medium">{report.total_active_hours}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Report Sent:</span>
                    <Badge variant={report.report_sent ? "default" : "secondary"}>
                      {report.report_sent ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyReportsView;
