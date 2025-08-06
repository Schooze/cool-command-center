import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Monitor, Settings, FileText, Network, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Monitor,
      path: '/',
      description: 'Main monitoring dashboard'
    },
    {
      title: 'Maintenance',
      icon: MapPin,
      path: '/maintenance',
      description: 'Device maintenance and location monitoring'
    },
    {
      title: 'Configuration',
      icon: Settings,
      path: '/config',
      description: 'System settings and configuration'
    },
    {
      title: 'Things',
      icon: Network,
      path: '/things',
      description: 'IoT device management'
    },
    {
      title: 'Audit & Data Logging',
      icon: FileText,
      path: '/audit',
      description: 'System audit and data logging'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full justify-start ${
                        isActive 
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                          : ''
                      }`}
                      tooltip={item.description}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Additional sidebar sections can be added here */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="w-full justify-start text-muted-foreground"
                  disabled
                >
                  <div className="h-2 w-2 rounded-full bg-status-active mr-2" />
                  <span className="text-sm">System Online</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;