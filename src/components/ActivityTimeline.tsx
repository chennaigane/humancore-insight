
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Monitor, Globe, Coffee, Pause } from 'lucide-react';
import { useActivityEvents, ActivityEvent } from '@/hooks/useActivityEvents';
import { formatDistanceStrict } from 'date-fns';

interface ActivityTimelineProps {
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

const ActivityTimeline = ({ sessionId, startDate, endDate }: ActivityTimelineProps) => {
  const { activities, loading, fetchActivities } = useActivityEvents();

  useEffect(() => {
    fetchActivities({ sessionId, startDate, endDate });
  }, [sessionId, startDate, endDate, fetchActivities]);

  const getActivityIcon = (activity: ActivityEvent) => {
    switch (activity.activity_type) {
      case 'APP':
        return <Monitor className="w-4 h-4" />;
      case 'WEBSITE':
        return <Globe className="w-4 h-4" />;
      case 'IDLE':
        return <Clock className="w-4 h-4" />;
      case 'PAUSE':
        return <Pause className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getActivityColor = (activity: ActivityEvent) => {
    const category = (activity as any).categories;
    if (category) {
      switch (category.productivity) {
        case 'PRODUCTIVE':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'UNPRODUCTIVE':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    }
    
    switch (activity.activity_type) {
      case 'IDLE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PAUSE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getActivityTitle = (activity: ActivityEvent) => {
    if (activity.activity_type === 'IDLE') return 'Idle Time';
    if (activity.activity_type === 'PAUSE') return 'Break Time';
    if (activity.app_name) return activity.app_name;
    if (activity.url_domain) return activity.url_domain;
    return 'Unknown Activity';
  };

  const getActivitySubtitle = (activity: ActivityEvent) => {
    if (activity.window_title) return activity.window_title;
    if (activity.url_path && activity.url_path !== '/') return activity.url_path;
    if (activity.process_name) return activity.process_name;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading activities...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {getActivityTitle(activity)}
                      </h4>
                      <Badge className={`text-xs ${getActivityColor(activity)}`}>
                        {formatDuration(activity.duration_seconds)}
                      </Badge>
                    </div>
                    
                    {getActivitySubtitle(activity) && (
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {getActivitySubtitle(activity)}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(activity.start_time).toLocaleTimeString()}
                      </span>
                      {activity.end_time && (
                        <>
                          <span>→</span>
                          <span>
                            {new Date(activity.end_time).toLocaleTimeString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
