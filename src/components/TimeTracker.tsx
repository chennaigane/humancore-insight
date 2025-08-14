
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, Coffee, Square } from 'lucide-react';
import { useWorkSession } from '@/hooks/useWorkSession';
import { useActivityEvents } from '@/hooks/useActivityEvents';
import { toast } from 'sonner';

const TimeTracker = () => {
  const { currentSession, isTracking, sessionStartTime, startSession, endSession } = useWorkSession();
  const { addActivityEvent } = useActivityEvents();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);

  // Update elapsed time every second
  useEffect(() => {
    if (!isTracking || !sessionStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - sessionStartTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, sessionStartTime]);

  const handleStart = async () => {
    if (!currentSession) {
      await startSession();
      toast.success('Work session started');
    }
  };

  const handlePause = async () => {
    if (!currentSession) return;

    if (isPaused) {
      // Resume from pause
      if (pauseStartTime) {
        const pauseDuration = Math.floor((new Date().getTime() - pauseStartTime.getTime()) / 1000);
        
        await addActivityEvent({
          session_id: currentSession.id,
          start_time: pauseStartTime.toISOString(),
          end_time: new Date().toISOString(),
          activity_type: 'PAUSE',
          app_name: null,
          process_name: null,
          url_domain: null,
          url_path: null,
          window_title: null,
          category_id: null,
          duration_seconds: pauseDuration,
        });
      }
      
      setIsPaused(false);
      setPauseStartTime(null);
      toast.success('Session resumed');
    } else {
      // Start pause
      setIsPaused(true);
      setPauseStartTime(new Date());
      toast.info('Session paused');
    }
  };

  const handleBreak = async () => {
    if (!currentSession) return;

    const breakStartTime = new Date();
    await addActivityEvent({
      session_id: currentSession.id,
      start_time: breakStartTime.toISOString(),
      end_time: new Date(breakStartTime.getTime() + 15 * 60 * 1000).toISOString(), // 15 minute break
      activity_type: 'PAUSE',
      app_name: null,
      process_name: null,
      url_domain: null,
      url_path: null,
      window_title: 'Break Time',
      category_id: null,
      duration_seconds: 15 * 60,
    });

    toast.success('15-minute break started');
  };

  const handleStop = async () => {
    if (currentSession) {
      await endSession();
      setElapsedTime('00:00:00');
      setIsPaused(false);
      setPauseStartTime(null);
      toast.success('Work session ended');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-primary mb-2">
            {elapsedTime}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? (isPaused ? "Paused" : "Active") : "Stopped"}
            </Badge>
            {currentSession && (
              <Badge variant="outline">
                Session: {new Date(currentSession.start_time).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {!isTracking ? (
            <Button 
              onClick={handleStart} 
              className="col-span-2 gap-2"
              size="lg"
            >
              <Play className="w-4 h-4" />
              Start Working
            </Button>
          ) : (
            <>
              <Button 
                onClick={handlePause} 
                variant={isPaused ? "default" : "outline"}
                className="gap-2"
              >
                <Pause className="w-4 h-4" />
                {isPaused ? "Resume" : "Pause"}
              </Button>
              
              <Button 
                onClick={handleBreak} 
                variant="outline"
                className="gap-2"
              >
                <Coffee className="w-4 h-4" />
                Break
              </Button>
              
              <Button 
                onClick={handleStop} 
                variant="destructive"
                className="col-span-2 gap-2"
              >
                <Square className="w-4 h-4" />
                End Session
              </Button>
            </>
          )}
        </div>

        {/* Session Info */}
        {currentSession && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Started: {new Date(currentSession.start_time).toLocaleTimeString()}</div>
            <div>Active: {currentSession.total_active_minutes} minutes</div>
            <div>Idle: {currentSession.total_idle_minutes} minutes</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
