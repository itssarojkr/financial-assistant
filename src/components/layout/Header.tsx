import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserProfile } from '@/components/auth/UserProfile';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { Calculator, User, LogOut, Settings, BarChart3, Save, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onSaveCalculation?: () => void;
  hasCalculation?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSaveCalculation, hasCalculation = false }) => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleSaveCalculation = () => {
    if (onSaveCalculation) {
      onSaveCalculation();
    }
  };

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Financial Assistant</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Financial Assistant</span>
          </div>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDashboard(true)}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>User Dashboard</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Financial Dashboard</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/help')}
                className="flex items-center space-x-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </Button>
            </nav>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {hasCalculation && user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveCalculation}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Calculation</span>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                    <AvatarFallback>{getInitials(user.email || '')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.first_name && user.user_metadata?.last_name
                        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                        : 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDashboard(true)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>User Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Financial Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <UserProfile onClose={() => setShowProfile(false)} />
        </DialogContent>
      </Dialog>

      {/* Dashboard Dialog */}
      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Dashboard</DialogTitle>
          </DialogHeader>
          <UserDashboard onClose={() => setShowDashboard(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}; 