
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'offline' | 'break';
  activity: string;
  productivity: number;
  active_time: string;
  productive_time: string;
  role: 'admin' | 'user';
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchTeamMembers = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async (member: { name: string; email: string; role: 'admin' | 'user' }) => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([
          {
            name: member.name,
            email: member.email,
            role: member.role,
            created_by: session.user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding team member:', error);
        return;
      }

      setTeamMembers(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [session]);

  return {
    teamMembers,
    loading,
    addTeamMember,
    refetch: fetchTeamMembers,
  };
};
