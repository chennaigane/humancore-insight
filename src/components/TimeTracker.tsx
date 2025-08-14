
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Coffee } from 'lucide-react';
import { useWorkSession } from '@/hooks/useWorkSession';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { toast } from 'sonner';

const TimeTracker = () => {
  const { currentSession, isTracking, sessionStartTime, startSession, endSession } = useWorkSession();
  const { currentActivity, startTracking, stopTracking } = useTimeTracking();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isPaused, setIsPaused] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    if (!sessionStartTime || !isTracking) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - sessionStartTime.getTime();
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
      
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, isTracking]);

  const handleStartWork = async () => {
    if (!currentSession) {
      await startSession();
    }
    startTracking('productive');
    setIsPaused(false);
    toast.success('Work session started');
  };

  const handlePause = () => {
    stopTracking();
    setIsPaused(true);
    toast.info('Work session paused');
  };

  const handleResume = () => {
    startTracking('productive');
    setIsPaused(false);
    toast.success('Work session resumed');
  };

  const handleBreak = () => {
    startTracking('unproductive');
    setIsPaused(false);
    toast.info('Break time started');
  };

  const handleStop = async () => {
    stopTracking();
    await endSession();
    setIsPaused(false);
    toast.success('Work session ended');
  };

  const getStatusColor = () => {
    if (!isTracking) return 'bg-gray-500';
    if (isPaused) return 'bg-yellow-500';
    if (currentActivity === 'productive') return 'bg-green-500';
    if (currentActivity === 'unproductive') return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (!isTracking) return 'Offline';
    if (isPaused) return 'Paused';
    if (currentActivity === 'productive') return 'Working';
    if (currentActivity === 'unproductive') return 'On Break';
    return 'Idle';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-foreground mb-2">
            {elapsedTime}
          </div>
          <Badge variant="outline" className="text-sm">
            {getStatusText()}
          </Badge>
        </div>

        {/* Session Info */}
        {currentSession && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Session started: {new Date(currentSession.start_time).toLocaleTimeString()}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-col gap-2">
          {!isTracking ? (
            <Button onClick={handleStartWork} className="w-full gap-2">
              <Play className="w-4 h-4" />
              Start Work Session
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {!isPaused ? (
                <>
                  <Button onClick={handlePause} variant="outline" className="gap-1">
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                  <Button onClick={handleBreak} variant="outline" className="gap-1">
                    <Coffee className="w-4 h-4" />
                    Break
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleResume} className="gap-1">
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                  <Button onClick={handleBreak} variant="outline" className="gap-1">
                    <Coffee className="w-4 h-4" />
                    Break
                  </Button>
                </>
              )}
            </div>
          )}
          
          {isTracking && (
            <Button onClick={handleStop} variant="destructive" className="w-full gap-2">
              <Square className="w-4 h-4" />
              End Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
