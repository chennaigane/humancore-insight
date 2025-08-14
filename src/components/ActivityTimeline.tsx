
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Monitor, Globe, Coffee, Pause } from 'lucide-react';
import { useActivityEvents } from '@/hooks/useActivityEvents';

interface ActivityTimelineProps {
  sessionId?: string;
}

const ActivityTimeline = ({ sessionId }: ActivityTimelineProps) => {
  const { activities, loading, fetchActivities } = useActivityEvents();

  useEffect(() => {
    if (sessionId) {
      fetchActivities({ sessionId });
    } else {
      // Fetch today's activities
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
      fetchActivities({ startDate: startOfDay, endDate: endOfDay });
    }
  }, [sessionId, fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading activities...</div>
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
        <ScrollArea className="h-96">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No activities recorded yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => {
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getActivityIcon(activity.activity_type)}
                        <span className="font-medium truncate">
                          {activity.activity_type === 'APP' ? activity.app_name :
                           activity.activity_type === 'WEBSITE' ? activity.url_domain :
                           activity.activity_type === 'IDLE' ? 'Idle Time' :
                           'Break/Pause'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatDuration(activity.duration_seconds)}
                        </Badge>
                      </div>
                      
                      {activity.window_title && (
                        <div className="text-sm text-muted-foreground truncate mb-1">
                          {activity.window_title}
                        </div>
                      )}
                      
                      {activity.url_path && (
                        <div className="text-xs text-muted-foreground truncate mb-1">
                          {activity.url_domain}{activity.url_path}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(activity.start_time).toLocaleTimeString()}</span>
                        <Badge variant="secondary" className="text-xs">
                          {activity.activity_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
