import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'signup' | 'reset';

export const Auth: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSuccess = () => {
    // For login, redirect will happen automatically via useEffect
    // For signup, user needs to verify email first
    if (mode === 'signup') {
      // Stay on the page to show email verification message
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToReset={() => setMode('reset')}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        );
      case 'reset':
        return (
          <PasswordResetForm
            onSwitchToLogin={() => setMode('login')}
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