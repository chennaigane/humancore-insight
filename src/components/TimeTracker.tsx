
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock, TrendingUp, Activity } from 'lucide-react';
import { useTimeTracking } from '@/hooks/useTimeTracking';

const TimeTracker = () => {
  const { isTracking, currentActivity, startTracking, stopTracking } = useTimeTracking();

  const handleStartProductive = () => {
    if (isTracking) stopTracking();
    startTracking('productive');
  };

  const handleStartUnproductive = () => {
    if (isTracking) stopTracking();
    startTracking('unproductive');
  };

  const handleStop = () => {
    stopTracking();
  };

  const getStatusColor = () => {
    if (!isTracking) return 'bg-gray-500';
    return currentActivity === 'productive' ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    if (!isTracking) return 'Offline';
    return currentActivity === 'productive' ? 'Productive Work' : 'Unproductive Time';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={handleStartProductive}
            disabled={isTracking && currentActivity === 'productive'}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Start Productive Work
          </Button>
          
          <Button
            onClick={handleStartUnproductive}
            disabled={isTracking && currentActivity === 'unproductive'}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <Activity className="h-4 w-4 mr-2" />
            Start Break/Idle Time
          </Button>
          
          {isTracking && (
            <Button
              onClick={handleStop}
              variant="destructive"
              className="mt-2"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Tracking
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground mt-4 p-3 bg-gray-50 rounded">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1">
            <li>• Click "Start Productive Work" when actively working</li>
            <li>• Click "Start Break/Idle Time" during breaks or idle time</li>
            <li>• Time is automatically tracked every minute</li>
            <li>• Reports are generated at the end of each day</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
