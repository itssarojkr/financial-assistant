import { useState, useEffect, useCallback } from 'react';

/**
 * Theme types supported by the application
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Theme hook result interface
 */
export interface UseThemeResult {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Custom hook for theme management
 * 
 * This hook provides theme state management with persistence
 * and automatic system theme detection.
 */
export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage or default to 'auto'
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme && ['light', 'dark', 'auto'].includes(savedTheme) ? savedTheme : 'auto';
  });

  const [isDark, setIsDark] = useState(false);

  // Update theme in localStorage and apply to document
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Apply theme to document and update isDark state
  useEffect(() => {
    const applyTheme = () => {
      let effectiveTheme: 'light' | 'dark';

      if (theme === 'auto') {
        // Use system preference
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effectiveTheme = theme;
      }

      // Apply theme to document
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
      
      // Update isDark state
      setIsDark(effectiveTheme === 'dark');
    };

    applyTheme();

    // Listen for system theme changes when using 'auto'
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
} 