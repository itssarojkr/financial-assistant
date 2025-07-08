import { useState, useEffect, useCallback } from 'react';

/**
 * Mobile hook result interface
 */
export interface UseMobileResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Breakpoint configuration
 */
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Custom hook for mobile device detection and responsive design
 * 
 * This hook provides device detection, screen size monitoring,
 * and responsive breakpoint information.
 */
export function useMobile(): UseMobileResult {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' ? (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') : 'portrait'
  );

  // Get current breakpoint based on screen width
  const getBreakpoint = useCallback((width: number): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }, []);

  // Update screen size and orientation
  const updateScreenInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    setScreenSize({ width, height });
    setOrientation(width > height ? 'landscape' : 'portrait');
  }, []);

  // Handle window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    updateScreenInfo();

    const handleResize = () => {
      updateScreenInfo();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updateScreenInfo]);

  // Calculate device types based on screen size
  const breakpoint = getBreakpoint(screenSize.width);
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    orientation,
    breakpoint,
  };
} 