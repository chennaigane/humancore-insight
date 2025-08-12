
import { Activity, Clock, TrendingUp, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import TimeTracker from './TimeTracker';
import DailyReportsView from './DailyReportsView';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user?.email}</h1>
        <p className="text-muted-foreground">User Dashboard - Track your productivity</p>
      </div>

      {/* Time Tracker and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TimeTracker />
        </div>
        
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="card-gradient border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Activity</CardTitle>
                <Activity className="h-4 w-4 text-brand-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">Auto Tracked</div>
                <p className="text-xs text-status-online mt-1">Real-time monitoring</p>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Status</CardTitle>
                <Monitor className="h-4 w-4 text-status-offline" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-100">
                    Tracking Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Automatic time tracking</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Daily Reports */}
      <DailyReportsView />

      {/* Instructions */}
      <Card className="card-gradient border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">How Time Tracking Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Automatic Tracking</h3>
                  <p className="text-sm text-muted-foreground">Time is tracked every minute automatically</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-status rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Hourly Updates</h3>
                  <p className="text-sm text-muted-foreground">Data is saved every hour to the database</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Daily Reports</h3>
                  <p className="text-sm text-muted-foreground">Admins receive email reports daily</p>
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
