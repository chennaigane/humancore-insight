
import { Users, UserCheck2, TrendingUp, Crown, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onAddMember: (member: { name: string; email: string; role: 'admin' | 'user' }) => void;
}

const AdminDashboard = ({ onAddMember }: AdminDashboardProps) => {
  const { teamMembers, loading, addTeamMember } = useTeamMembers();
  const { user } = useAuth();

  const handleAddMember = async (newMember: { name: string; email: string; role: 'admin' | 'user' }) => {
    await addTeamMember(newMember);
    onAddMember(newMember);
  };

  const sendDailyReports = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-reports');
      
      if (error) {
        console.error('Error sending reports:', error);
        toast.error('Failed to send daily reports');
        return;
      }

      toast.success('Daily reports sent successfully to all admins');
      console.log('Reports sent:', data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send daily reports');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  const totalMembers = teamMembers.length;
  const onlineMembers = teamMembers.filter(m => m.status === 'active').length;
  const avgProductivity = totalMembers > 0 
    ? Math.round(teamMembers.reduce((sum, m) => sum + m.productivity, 0) / totalMembers)
    : 0;
  const admins = teamMembers.filter(m => m.role === 'admin').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-online';
      case 'offline': return 'status-offline';
      case 'break': return 'status-away';
      default: return 'status-offline';
    }
  };

  const getProductivityColor = (productivity: number) => {
    if (productivity >= 85) return 'productivity-high';
    if (productivity >= 70) return 'productivity-medium';
    return 'productivity-low';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user?.email}</h1>
          <p className="text-muted-foreground">Admin Dashboard - Monitor team productivity and send reports</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendDailyReports} className="gap-2">
            <Mail className="h-4 w-4" />
            Send Daily Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <Users className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalMembers}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online Now</CardTitle>
            <UserCheck2 className="h-4 w-4 text-status-online" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-online">{onlineMembers}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgProductivity}%</div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            <Crown className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Auto Tracking Info */}
      <Card className="card-gradient border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Automatic Time Tracking System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Hourly Monitoring</h3>
              <p className="text-sm text-green-600">Employee time is automatically tracked every minute and stored hourly</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Daily Reports</h3>
              <p className="text-sm text-blue-600">End-of-day productivity reports are generated and can be emailed to admins</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-800 mb-2">Real-time Dashboard</h3>
              <p className="text-sm text-purple-600">View team productivity metrics and individual performance in real-time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Team Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <Card 
              key={member.id} 
              className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        {member.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className={`status-indicator ${getStatusColor(member.status)}`}></div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Activity</span>
                  <span className="text-sm font-medium text-foreground capitalize">{member.activity}</span>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Productivity</span>
                    <span className="text-sm font-bold text-foreground">{member.productivity}%</span>
                  </div>
                  <div className="productivity-bar">
                    <div 
                      className={`productivity-fill ${getProductivityColor(member.productivity)}`}
                      style={{ width: `${member.productivity}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Active:</span>
                    <div className="font-medium text-foreground">{member.active_time}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Productive:</span>
                    <div className="font-medium text-foreground">{member.productive_time}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
