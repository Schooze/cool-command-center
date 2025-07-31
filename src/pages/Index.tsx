import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'nav'>('dashboard');

  if (currentView === 'dashboard') {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <Button 
            onClick={() => navigate('/config')}
            className="shadow-lg"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
        <Dashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Cooling Room Controller</h1>
          <p className="text-xl text-muted-foreground">Industrial Temperature Monitoring & Control System</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('dashboard')}>
            <CardHeader className="text-center">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Monitor sensors, temperatures, and system status in real-time</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/config')}>
            <CardHeader className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure auto mode, defrost settings, and system parameters</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
