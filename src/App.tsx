import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import Dashboard from "@/components/Dashboard";
import AuditDataLogging from "@/components/AuditDataLogging";
import Config from "@/pages/ConfigPage";
import ThingsPage from "@/pages/ThingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard Route */}
          <Route 
            path="/" 
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } 
          />
          
          {/* Things Route */}
          <Route 
            path="/things" 
            element={
              <MainLayout>
                <ThingsPage />
              </MainLayout>
            } 
          />
          
          {/* Audit & Data Logging Route */}
          <Route 
            path="/audit" 
            element={
              <MainLayout>
                <AuditDataLogging />
              </MainLayout>
            } 
          />
          
          {/* Configuration Route */}
          <Route 
            path="/config" 
            element={
              <MainLayout>
                <Config />
              </MainLayout>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;