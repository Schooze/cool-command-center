import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className || ''}`}>
      <div className="flex h-16 items-center px-4">
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

        {/* Spacer to push content to the right if needed */}
        <div className="flex-1" />
        
        {/* Additional header content can be added here */}
      </div>
    </header>
  );
};

export default Header;