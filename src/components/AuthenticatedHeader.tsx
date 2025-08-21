export default AuthenticatedHeader;// src/components/AuthenticatedHeader.tsx - Updated with Role Display
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  PanelLeft, 
  LogOut, 
  User, 
  Settings, 
  Snowflake,
  Clock,
  Shield,
  Loader2,
  Wrench,
  UserCheck
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface AuthenticatedHeaderProps {
  className?: string;
}

const AuthenticatedHeader: React.FC<AuthenticatedHeaderProps> = ({ className }) => {
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format user creation date
  const formatUserDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get role badge variant and icon
  const getRoleInfo = (accountType: string) => {
    switch (accountType) {
      case 'admin':
        return {
          variant: 'default' as const,
          icon: Shield,
          label: 'Administrator',
          color: 'text-blue-600'
        };
      case 'teknisi':
        return {
          variant: 'secondary' as const,
          icon: Wrench,
          label: 'Teknisi',
          color: 'text-green-600'
        };
      case 'client':
        return {
          variant: 'outline' as const,
          icon: UserCheck,
          label: 'Client',
          color: 'text-purple-600'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: User,
          label: 'User',
          color: 'text-gray-600'
        };
    }
  };

  const roleInfo = user ? getRoleInfo(user.account_type) : null;

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className || ''}`}>
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Section - Sidebar Toggle & Logo */}
        <div className="flex items-center">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 h-9 w-9"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/koronka_text_clear.png"
              alt="Koronka Logo"
              className="h-8 w-auto"
            />
          </div>
        </div>

        {/* Right Section - Role Badge & User Info */}
        <div className="flex items-center space-x-4">
          {/* Role Badge */}
          {user && roleInfo && (
            <Badge variant={roleInfo.variant} className="flex items-center gap-2">
              <roleInfo.icon className="h-4 w-4" />
              {roleInfo.label}
            </Badge>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-auto px-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                      {user ? getUserInitials(user.username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {roleInfo?.label || 'Unknown Role'}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.username}
                  </p>
                  <div className="flex items-center gap-2">
                    {roleInfo && (
                      <>
                        <roleInfo.icon className={`h-4 w-4 ${roleInfo.color}`} />
                        <p className={`text-xs ${roleInfo.color}`}>
                          {roleInfo.label}
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Bergabung: {user ? formatUserDate(user.created_at) : '-'}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};