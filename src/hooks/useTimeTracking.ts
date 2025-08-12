
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TimeTrackingData {
  id: string;
  user_id: string;
  date: string;
  hour_slot: number;
  productive_minutes: number;
  unproductive_minutes: number;
  total_minutes: number;
  activity_type: string;
}

export interface DailyReport {
  id: string;
  user_id: string;
  date: string;
  total_productive_hours: number;
  total_unproductive_hours: number;
  total_active_hours: number;
  productivity_percentage: number;
  report_sent: boolean;
}

export const useTimeTracking = () => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<'productive' | 'unproductive' | 'offline'>('offline');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Update time tracking every minute
  const updateTimeTracking = useCallback(async (productiveMinutes = 0, unproductiveMinutes = 0, activityType = 'offline') => {
    if (!user) return;

    try {
      const { error } = await (supabase as any).rpc('update_hourly_tracking', {
        p_user_id: user.id,
        p_productive_mins: productiveMinutes,
        p_unproductive_mins: unproductiveMinutes,
        p_activity_type: activityType
      });

      if (error) {
        console.error('Error updating time tracking:', error);
      }
    } catch (error) {
      console.error('Error in updateTimeTracking:', error);
    }
  }, [user]);

  // Start tracking session
  const startTracking = useCallback((activityType: 'productive' | 'unproductive') => {
    setIsTracking(true);
    setCurrentActivity(activityType);
    setSessionStartTime(Date.now());
    console.log(`Started tracking: ${activityType} activity`);
  }, []);

  // Stop tracking session
  const stopTracking = useCallback(async () => {
    if (!sessionStartTime || !isTracking) return;

    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / (1000 * 60)); // in minutes
    
    if (sessionDuration > 0) {
      if (currentActivity === 'productive') {
        await updateTimeTracking(sessionDuration, 0, 'active');
      } else if (currentActivity === 'unproductive') {
        await updateTimeTracking(0, sessionDuration, 'idle');
      }
    }

    setIsTracking(false);
    setCurrentActivity('offline');
    setSessionStartTime(null);
    console.log(`Stopped tracking. Duration: ${sessionDuration} minutes`);
  }, [sessionStartTime, isTracking, currentActivity, updateTimeTracking]);

  // Automatic tracking - record activity every minute
  useEffect(() => {
    if (!isTracking || !sessionStartTime) return;

    const interval = setInterval(async () => {
      const minutesPassed = Math.floor((Date.now() - sessionStartTime) / (1000 * 60));
      
      if (minutesPassed > 0) {
        if (currentActivity === 'productive') {
          await updateTimeTracking(1, 0, 'active');
        } else if (currentActivity === 'unproductive') {
          await updateTimeTracking(0, 1, 'idle');
        }
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [isTracking, sessionStartTime, currentActivity, updateTimeTracking]);

  return {
    isTracking,
    currentActivity,
    startTracking,
    stopTracking,
    updateTimeTracking
  };
};
