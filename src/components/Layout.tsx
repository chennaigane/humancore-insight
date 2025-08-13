
import { useState } from 'react';
import { Users, User, Settings, BarChart3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AddMemberDialog from './AddMemberDialog';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'admin' | 'user';
  onViewChange: (view: 'admin' | 'user') => void;
  onAddMember?: (member: { name: string; email: string; role: 'admin' | 'user' }) => void;
  userRole: 'admin' | 'user' | null;
}

const Layout = ({ children, currentView, onAddMember, userRole }: LayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`bg-card border-r border-border transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            {isExpanded && (
              <div>
                <h1 className="text-xl font-bold text-brand-blue">Metrx</h1>
                <p className="text-xs text-muted-foreground capitalize">{userRole} Portal</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {userRole === 'admin' ? (
            <Button
              variant="default"
              className={`w-full justify-start gap-3 ${!isExpanded && 'px-2'}`}
              disabled
            >
              <Users className="w-4 h-4" />
              {isExpanded && 'Admin Dashboard'}
            </Button>
          ) : (
            <Button
              variant="default"
              className={`w-full justify-start gap-3 ${!isExpanded && 'px-2'}`}
              disabled
            >
              <User className="w-4 h-4" />
              {isExpanded && 'User Dashboard'}
            </Button>
          )}

          {/* Add Member Dialog - Only show for admin */}
          {userRole === 'admin' && isExpanded && onAddMember && (
            <div className="pt-4">
              <AddMemberDialog onAddMember={onAddMember} />
            </div>
          )}
        </nav>
        
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-3 ${!isExpanded && 'px-2'}`}
          >
            <Settings className="w-4 h-4" />
            {isExpanded && 'Settings'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-3 ${!isExpanded && 'px-2'} text-destructive hover:text-destructive`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {isExpanded && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {userRole === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
              </div>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
