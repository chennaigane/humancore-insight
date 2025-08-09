
import { Users, UserCheck2, TrendingUp, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'offline' | 'break';
  activity: string;
  productivity: number;
  activeTime: string;
  productiveTime: string;
  role: 'admin' | 'user';
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Kiran',
    email: 'kiran@company.com',
    status: 'active',
    activity: 'coding',
    productivity: 87,
    activeTime: '7h 45m',
    productiveTime: '6h 54m',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Ganesh',
    email: 'ganesh@company.com',
    status: 'active',
    activity: 'meeting',
    productivity: 81,
    activeTime: '8h 30m',
    productiveTime: '6h 54m',
    role: 'user'
  },
  {
    id: '3',
    name: 'Raghavendra',
    email: 'raghavendra@company.com',
    status: 'offline',
    activity: 'break',
    productivity: 91,
    activeTime: '6h 45m',
    productiveTime: '6h 10m',
    role: 'user'
  },
  {
    id: '4',
    name: 'Dhanashvil',
    email: 'dhanashvil@company.com',
    status: 'active',
    activity: 'documentation',
    productivity: 90,
    activeTime: '7h 43m',
    productiveTime: '6h 59m',
    role: 'user'
  },
  {
    id: '5',
    name: 'Jahaeshwaran',
    email: 'jahaeshwaran@company.com',
    status: 'active',
    activity: 'testing',
    productivity: 75,
    activeTime: '5h 45m',
    productiveTime: '4h 19m',
    role: 'user'
  },
  {
    id: '6',
    name: 'Janardhnavari',
    email: 'janardhnavari@company.com',
    status: 'offline',
    activity: 'offline',
    productivity: 65,
    activeTime: '3h 46m',
    productiveTime: '2h 30m',
    role: 'user'
  }
];

const AdminDashboard = () => {
  const totalMembers = teamMembers.length;
  const onlineMembers = teamMembers.filter(m => m.status === 'active').length;
  const avgProductivity = Math.round(teamMembers.reduce((sum, m) => sum + m.productivity, 0) / totalMembers);
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
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, Admin</h1>
        <p className="text-muted-foreground">Admin Dashboard - View and manage all team members</p>
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
                    <div className="font-medium text-foreground">{member.activeTime}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Productive:</span>
                    <div className="font-medium text-foreground">{member.productiveTime}</div>
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
