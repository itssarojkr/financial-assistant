import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/presentation/hooks/business/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * 
 * This component protects routes that require authentication
 * and redirects unauthenticated users to the login page.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required and user is authenticated
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected content
  return <>{children}</>;
}; 
