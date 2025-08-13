
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

      // Transform the data to match our TeamMember interface
      const transformedData: TeamMember[] = (data || []).map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        status: member.status as 'active' | 'offline' | 'break',
        activity: member.activity,
        productivity: member.productivity,
        active_time: member.active_time,
        productive_time: member.productive_time,
        role: member.role as 'admin' | 'user',
      }));

      setTeamMembers(transformedData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async (member: { name: string; email: string; role: 'admin' | 'user' }) => {
    if (!session) return;

    try {
      // First create the profile record with a generated UUID
      const userId = crypto.randomUUID();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: member.email,
            full_name: member.name,
            role: member.role,
          }
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return;
      }

      // Then create the team member record
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

      // Transform the new member data
      const newMember: TeamMember = {
        id: data.id,
        name: data.name,
        email: data.email,
        status: data.status as 'active' | 'offline' | 'break',
        activity: data.activity,
        productivity: data.productivity,
        active_time: data.active_time,
        productive_time: data.productive_time,
        role: data.role as 'admin' | 'user',
      };

      setTeamMembers(prev => [...prev, newMember]);
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
