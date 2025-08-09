
import { useState } from 'react';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<'admin' | 'user'>('admin');

  const handleViewChange = (view: 'admin' | 'user') => {
    setCurrentView(view);
  };

  return (
    <Layout currentView={currentView} onViewChange={handleViewChange}>
      {currentView === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </Layout>
  );
};

export default Index;
