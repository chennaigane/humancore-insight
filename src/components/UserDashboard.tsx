
import { Activity, Clock, TrendingUp, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UserDashboard = () => {
  // Sample user data
  const userData = {
    name: 'chennaiganc@gmail.com',
    status: 'Offline',
    todayTime: '0m',
    productivity: 0,
    activities: 0,
    weeklyOverview: 'No activity data available',
    productivityBreakdown: 'No data available'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {userData.name}</h1>
        <p className="text-muted-foreground">User Dashboard - Manage your activities</p>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Activities</CardTitle>
            <Activity className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userData.activities}</div>
            <p className="text-xs text-status-online mt-1">0 active today</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Status</CardTitle>
            <Monitor className="h-4 w-4 text-status-offline" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-100">
                {userData.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Real-time status</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Time</CardTitle>
            <Clock className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userData.todayTime}</div>
            <p className="text-xs text-muted-foreground mt-1">Below average</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userData.productivity}%</div>
            <p className="text-xs text-muted-foreground mt-1">Room for improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-gradient border-0 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Weekly Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">{userData.weeklyOverview}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-0 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Today's Productivity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">{userData.productivityBreakdown}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-gradient border-0 shadow-lg animate-scale-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Start Activity</h3>
                  <p className="text-sm text-muted-foreground">Begin tracking your work</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-status rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Take Break</h3>
                  <p className="text-sm text-muted-foreground">Pause your current session</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">View Reports</h3>
                  <p className="text-sm text-muted-foreground">Check your analytics</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
