import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/MainLayout";
import Dashboard from "@/components/Dashboard";
import AuditDataLogging from "@/components/AuditDataLogging";
import Config from "@/pages/ConfigPage";
import ThingsPage from "@/pages/ThingsPage";
import MaintenancePage from "@/pages/MaintenancePage";
import LoginPage from "@/pages/LoginPage";

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
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/maintenance" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MaintenancePage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/things" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ThingsPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/audit" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AuditDataLogging />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/config" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Config />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;