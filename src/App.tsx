// src/App.tsx - Complete Fixed Version with proper routing
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

// Auth Components
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';

// Layout Components
import MainLayout from '@/components/MainLayout';

// Page Components
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import MaintenancePage from '@/pages/MaintenancePage';
import ThingsPage from '@/pages/ThingsPage';
import AuditDataLogging from '@/pages/AuditDataLogging';
import Config from '@/pages/Config';
import TeknisiPage from '@/pages/TeknisiPage';
import ClientPage from '@/pages/ClientPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  console.log('🚀 App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Root redirect based on role */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* ADMIN-ONLY Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/maintenance" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MainLayout>
                      <MaintenancePage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/things" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MainLayout>
                      <ThingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/audit" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MainLayout>
                      <AuditDataLogging />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/config" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MainLayout>
                      <Config />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />

              {/* TEKNISI-ONLY Route */}
              <Route 
                path="/teknisi" 
                element={
                  <ProtectedRoute allowedRoles={['teknisi']}>
                    <TeknisiPage />
                  </ProtectedRoute>
                } 
              />

              {/* CLIENT-ONLY Route */}
              <Route 
                path="/client" 
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientPage />
                  </ProtectedRoute>
                } 
              />

              {/* Unauthorized Route */}
              <Route 
                path="/unauthorized" 
                element={<UnauthorizedPage />} 
              />

              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900">404 - Halaman Tidak Ditemukan</h1>
                      <p className="text-gray-600 mt-2">Halaman yang Anda cari tidak ada.</p>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;