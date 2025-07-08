import React, { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthProps {
  mode?: AuthMode;
}

export const Auth: React.FC<AuthProps> = ({ mode: propMode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>(propMode || 'login');

  // Sync mode with prop (from route)
  useEffect(() => {
    if (propMode && ['login', 'signup'].includes(propMode)) {
      setMode(propMode);
    }
  }, [propMode]);

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      // If redirected from a protected route, go back to intended destination
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSuccess = () => {
    if (mode === 'signup') {
      // Stay on the page to show email verification message
    }
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    navigate('/login');
  };
  const handleSwitchToSignup = () => {
    setMode('signup');
    navigate('/signup');
  };
  const handleSwitchToReset = () => {
    setMode('reset');
    // Optionally, you could use a dedicated /reset route if desired
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToReset={handleSwitchToReset}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case 'reset':
        return (
          <PasswordResetForm
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      default:
        return <LoginForm />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {renderForm()}
      </div>
    </div>
  );
}; 