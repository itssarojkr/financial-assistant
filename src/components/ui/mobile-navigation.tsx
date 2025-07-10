import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Calculator, 
  BarChart3, 
  HelpCircle, 
  User, 
  LogOut, 
  Settings,
  Home
} from 'lucide-react';

interface MobileNavigationProps {
  onSaveCalculation?: () => void;
  hasCalculation?: boolean;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onSaveCalculation,
  hasCalculation = false
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calculator, label: 'Tax Calculator', path: '/tax-calculator' },
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col h-full">
            {/* User Section */}
            {user && (
              <div className="flex items-center space-x-3 p-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url ?? undefined} 
                    alt={user.email || 'User avatar'} 
                  />
                  <AvatarFallback>{getInitials(user.email || '')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.first_name && user.user_metadata?.last_name
                      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                      : 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
                
                {hasCalculation && user && onSaveCalculation && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      onSaveCalculation();
                      setIsOpen(false);
                    }}
                  >
                    <Calculator className="w-4 h-4 mr-3" />
                    Save Calculation
                  </Button>
                )}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t space-y-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/settings')}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleNavigation('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => handleNavigation('/signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};