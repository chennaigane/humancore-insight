
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  total_active_minutes: number;
  total_idle_minutes: number;
  is_active: boolean;
}

export interface ActivityEvent {
  id: string;
  session_id: string;
  start_time: string;
  end_time: string | null;
  activity_type: 'APP' | 'WEBSITE' | 'IDLE' | 'PAUSE';
  app_name: string | null;
  process_name: string | null;
  url_domain: string | null;
  url_path: string | null;
  window_title: string | null;
  category_id: string | null;
  duration_seconds: number;
}

export const useWorkSession = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Start a new work session
  const startSession = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .insert([
          {
            user_id: user.id,
            start_time: new Date().toISOString(),
            is_active: true,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return null;
      }

      setCurrentSession(data);
      setIsTracking(true);
      setSessionStartTime(new Date());
      console.log('Work session started:', data.id);
      return data;
    } catch (error) {
      console.error('Error in startSession:', error);
      return null;
    }
  }, [user]);

  // End the current work session
  const endSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      const { error } = await supabase
        .from('work_sessions')
        .update({
          end_time: new Date().toISOString(),
          is_active: false,
        })
        .eq('id', currentSession.id);

      if (error) {
        console.error('Error ending session:', error);
        return;
      }

      setCurrentSession(null);
      setIsTracking(false);
      setSessionStartTime(null);
      console.log('Work session ended:', currentSession.id);
    } catch (error) {
      console.error('Error in endSession:', error);
    }
  }, [currentSession]);

  // Get active session on mount
  useEffect(() => {
    const getActiveSession = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('work_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('start_time', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching active session:', error);
          return;
        }

        if (data) {
          setCurrentSession(data);
          setIsTracking(true);
          setSessionStartTime(new Date(data.start_time));
          console.log('Found active session:', data.id);
        }
      } catch (error) {
        console.error('Error in getActiveSession:', error);
      }
    };

    getActiveSession();
  }, [user]);

  // Auto-start session when user logs in
  useEffect(() => {
    if (user && !currentSession && !isTracking) {
      startSession();
    }
  }, [user, currentSession, isTracking, startSession]);

  return {
    currentSession,
    isTracking,
    sessionStartTime,
    startSession,
    endSession,
  };
};
