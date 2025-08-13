
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAddMember = (member: { name: string; email: string; role: 'admin' | 'user' }) => {
    console.log('New member added:', member);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-2">Loading...</div>
          <p className="text-muted-foreground">Please wait while we load your account</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Determine view based on user role
  const currentView = userRole === 'admin' ? 'admin' : 'user';

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={() => {}} // Disable view switching - role determines view
      onAddMember={userRole === 'admin' ? handleAddMember : undefined}
      userRole={userRole}
    >
      {userRole === 'admin' ? (
        <AdminDashboard onAddMember={handleAddMember} />
      ) : (
        <UserDashboard />
      )}
    </Layout>
  );
};

export default Index;
