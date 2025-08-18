
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityEvent } from './useWorkSession';

export interface ActivitySummary {
  totalActiveTime: number;
  totalIdleTime: number;
  totalPauseTime: number;
  productiveTime: number;
  unproductiveTime: number;
  neutralTime: number;
  topApps: Array<{ name: string; duration: number; percentage: number }>;
  topWebsites: Array<{ domain: string; duration: number; percentage: number }>;
}

export const useActivityEvents = (sessionId?: string) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch activities for a session or date range
  const fetchActivities = useCallback(async (filters?: {
    sessionId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('activity_events' as any)
        .select('*')
        .order('start_time', { ascending: false });

      if (filters?.sessionId) {
        query = query.eq('session_id', filters.sessionId);
      }

      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('start_time', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      setActivities((data as unknown as ActivityEvent[]) || []);
    } catch (error) {
      console.error('Error in fetchActivities:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add a new activity event
  const addActivityEvent = useCallback(async (activity: Omit<ActivityEvent, 'id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('activity_events' as any)
        .insert([activity])
        .select()
        .single();

      if (error) {
        console.error('Error adding activity:', error);
        return null;
      }

      if (data) {
        const newActivity = data as unknown as ActivityEvent;
        // Add to local state
        setActivities(prev => [newActivity, ...prev]);
        return newActivity;
      }
      
      return null;
    } catch (error) {
      console.error('Error in addActivityEvent:', error);
      return null;
    }
  }, [user]);

  // Calculate activity summary
  const calculateSummary = useCallback((activityList: ActivityEvent[]): ActivitySummary => {
    const summary: ActivitySummary = {
      totalActiveTime: 0,
      totalIdleTime: 0,
      totalPauseTime: 0,
      productiveTime: 0,
      unproductiveTime: 0,
      neutralTime: 0,
      topApps: [],
      topWebsites: [],
    };

    const appDurations: Record<string, number> = {};
    const websiteDurations: Record<string, number> = {};

    activityList.forEach(activity => {
      const duration = activity.duration_seconds;

      switch (activity.activity_type) {
        case 'IDLE':
          summary.totalIdleTime += duration;
          break;
        case 'PAUSE':
          summary.totalPauseTime += duration;
          break;
        default:
          summary.totalActiveTime += duration;
          // For now, treat all active time as neutral since we don't have categories yet
          summary.neutralTime += duration;

          // Track app usage
          if (activity.app_name) {
            appDurations[activity.app_name] = (appDurations[activity.app_name] || 0) + duration;
          }

          // Track website usage
          if (activity.url_domain) {
            websiteDurations[activity.url_domain] = (websiteDurations[activity.url_domain] || 0) + duration;
          }
      }
    });

    const totalTime = summary.totalActiveTime + summary.totalIdleTime + summary.totalPauseTime;

    // Calculate top apps
    summary.topApps = Object.entries(appDurations)
      .map(([name, duration]) => ({
        name,
        duration,
        percentage: totalTime > 0 ? (duration / totalTime) * 100 : 0,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Calculate top websites
    summary.topWebsites = Object.entries(websiteDurations)
      .map(([domain, duration]) => ({
        domain,
        duration,
        percentage: totalTime > 0 ? (duration / totalTime) * 100 : 0,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return summary;
  }, []);

  // Fetch activities when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchActivities({ sessionId });
    }
  }, [sessionId, fetchActivities]);

  return {
    activities,
    loading,
    fetchActivities,
    addActivityEvent,
    calculateSummary,
  };
};
