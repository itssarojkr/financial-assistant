import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4" role="main" aria-label="404 Not Found">
      <a href="#notfound-content" className="skip-link sr-only focus:not-sr-only absolute left-2 top-2 bg-blue-700 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <div className="text-center max-w-md w-full" id="notfound-content">
        <h1 className="text-6xl font-extrabold text-blue-700 mb-4" tabIndex={-1} aria-label="404 Error">404</h1>
        <p className="text-2xl font-semibold text-gray-700 mb-2">Oops! Page not found</p>
        <p className="text-base text-gray-500 mb-6">The page you are looking for does not exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all" aria-label="Go to Home">Home</a>
          <a href="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all" aria-label="Go to Dashboard">Dashboard</a>
          <a href="/help" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all" aria-label="Go to Help">Help</a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
