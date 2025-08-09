
import { useState } from 'react';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<'admin' | 'user'>('admin');

  const handleViewChange = (view: 'admin' | 'user') => {
    setCurrentView(view);
  };

  const handleAddMember = (member: { name: string; email: string; role: 'admin' | 'user' }) => {
    console.log('New member added:', member);
    // You can add additional logic here like API calls
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={handleViewChange}
      onAddMember={currentView === 'admin' ? handleAddMember : undefined}
    >
      {currentView === 'admin' ? (
        <AdminDashboard onAddMember={handleAddMember} />
      ) : (
        <UserDashboard />
      )}
    </Layout>
  );
};

export default Index;
