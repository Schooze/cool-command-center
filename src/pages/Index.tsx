import React from 'react';
import MainLayout from '@/components/MainLayout';
import Dashboard from '@/components/Dashboard';

const Index: React.FC = () => {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
};

export default Index;