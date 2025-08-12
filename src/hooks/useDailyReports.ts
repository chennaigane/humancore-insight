
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyReport {
  id: string;
  user_id: string;
  date: string;
  total_productive_hours: number;
  total_unproductive_hours: number;
  total_active_hours: number;
  productivity_percentage: number;
  report_sent: boolean;
  created_at: string;
}

export const useDailyReports = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDailyReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching daily reports:', error);
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error('Error in fetchDailyReports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyReport = async (date?: string) => {
    try {
      const { error } = await supabase.rpc('generate_daily_summary', {
        p_date: date || new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error generating daily report:', error);
        return;
      }

      await fetchDailyReports();
    } catch (error) {
      console.error('Error in generateDailyReport:', error);
    }
  };

  useEffect(() => {
    fetchDailyReports();
  }, [user]);

  return {
    reports,
    loading,
    fetchDailyReports,
    generateDailyReport
  };
};
