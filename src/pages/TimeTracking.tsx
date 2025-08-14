
import { useAuth } from '@/contexts/AuthContext';
import { useWorkSession } from '@/hooks/useWorkSession';
import { useActivityEvents } from '@/hooks/useActivityEvents';
import TimeTracker from '@/components/TimeTracker';
import ActivityTimeline from '@/components/ActivityTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, Coffee, Zap } from 'lucide-react';

const TimeTracking = () => {
  const { userRole } = useAuth();
  const { currentSession } = useWorkSession();
  const { activities, calculateSummary } = useActivityEvents(currentSession?.id);

  const summary = calculateSummary(activities);
  const totalTime = summary.totalActiveTime + summary.totalIdleTime + summary.totalPauseTime;
  const productivityPercentage = totalTime > 0 ? (summary.productiveTime / totalTime) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Time Tracking</h1>
        {userRole && (
          <div className="text-sm text-muted-foreground capitalize">
            {userRole} Dashboard
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracker Widget */}
        <div className="lg:col-span-1">
          <TimeTracker />
        </div>

        {/* Today's Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Productivity Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Productivity Score</span>
                  <span className="text-sm text-muted-foreground">
                    {productivityPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={productivityPercentage} className="h-2" />
              </div>

              {/* Time Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Productive</p>
                    <p className="font-medium">{formatTime(summary.productiveTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Neutral</p>
                    <p className="font-medium">{formatTime(summary.neutralTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Break</p>
                    <p className="font-medium">{formatTime(summary.unproductiveTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Idle</p>
                    <p className="font-medium">{formatTime(summary.totalIdleTime)}</p>
                  </div>
                </div>
              </div>

              {/* Top Apps */}
              {summary.topApps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Top Applications</h4>
                  <div className="space-y-1">
                    {summary.topApps.slice(0, 3).map((app, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate">{app.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {formatTime(app.duration)} ({app.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="grid grid-cols-1 gap-6">
        <ActivityTimeline sessionId={currentSession?.id} />
      </div>
    </div>
  );
};

export default TimeTracking;
