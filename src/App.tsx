import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner';

// Pages (code split)
const Landing = lazy(() => import('@/pages/Landing'));
const Auth = lazy(() => import('@/pages/Auth').then(m => ({ default: m.Auth })));
const DashboardPage = lazy(() => import('@/presentation/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const Index = lazy(() => import('@/pages/Index').then(m => ({ default: m.default })));
const Help = lazy(() => import('@/pages/Help').then(m => ({ default: m.default })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.default })));

// Components

// Styles
import '@/index.css';

/**
 * Main Application Component
 * 
 * This component serves as the root of the application and provides
 * routing, context providers, and the overall application structure.
 */
const App: React.FC = () => {

  return (
    <TooltipProvider>
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only absolute left-2 top-2 bg-blue-700 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <div id="main-content" className="min-h-screen bg-background">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite"><LoadingSpinner /> <span className="sr-only">Loading page...</span></div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tax-calculator" element={<Index />} />
            <Route path="/calculator" element={<Index />} />
            <Route path="/help" element={<Help />} />
            <Route path="/reset" element={<Auth mode="reset" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        {/* Global Components */}
        <Toaster />
      </div>
    </TooltipProvider>
  );
};

export default App;
