// src/App.tsx - Fixed with Role-Based Routing
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";
import MainLayout from "@/components/MainLayout";
import Dashboard from "@/components/Dashboard";
import AuditDataLogging from "@/components/AuditDataLogging";
import Config from "@/pages/ConfigPage";
import ThingsPage from "@/pages/ThingsPage";
import MaintenancePage from "@/pages/MaintenancePage";
import LoginPage from "@/pages/LoginPage";
import TeknisiPage from "@/pages/TeknisiPage";
import ClientPage from "@/pages/ClientPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Root Route - Role-based redirect */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } 
          />
          
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
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
                  <p className="text-gray-600 mt-2">Anda tidak memiliki akses ke halaman ini.</p>
                </div>
              </div>
            } 
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;