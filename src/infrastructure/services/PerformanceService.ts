import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'navigation' | 'resource' | 'user' | 'custom';
}

export interface PerformanceThreshold {
  name: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  severity: 'warning' | 'error' | 'critical';
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  violations: PerformanceThreshold[];
  recommendations: string[];
  timestamp: number;
}

export class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThreshold[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    this.setupDefaultThresholds();
    this.setupObservers();
    this.startMonitoring();
  }

  /**
   * Setup default performance thresholds
   */
  private setupDefaultThresholds(): void {
    this.thresholds = [
      { name: 'FCP', threshold: 2000, operator: 'gt', severity: 'warning' },
      { name: 'LCP', threshold: 2500, operator: 'gt', severity: 'error' },
      { name: 'FID', threshold: 100, operator: 'gt', severity: 'warning' },
      { name: 'CLS', threshold: 0.1, operator: 'gt', severity: 'error' },
      { name: 'TTFB', threshold: 600, operator: 'gt', severity: 'warning' }
    ];
  }

  /**
   * Setup performance observers
   */
  private setupObservers(): void {
    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              this.processNavigationTiming(entry as PerformanceNavigationTiming);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource') {
              this.processResourceTiming(entry as PerformanceResourceTiming);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }

      // Paint timing observer
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'paint') {
              this.processPaintTiming(entry as PerformancePaintTiming);
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        console.warn('Paint timing observer not supported:', error);
      }
    }
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'longtask') {
              this.addMetric('LongTask', entry.duration, 'ms', 'user');
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
        this.addMetric('MemoryUsed', memory.usedJSHeapSize / 1024 / 1024, 'MB', 'resource');
        this.addMetric('MemoryTotal', memory.totalJSHeapSize / 1024 / 1024, 'MB', 'resource');
      }, 5000);
    }

    // Monitor frame rate
    this.monitorFrameRate();
  }

  /**
   * Monitor frame rate
   */
  private monitorFrameRate(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrames = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.addMetric('FPS', fps, 'fps', 'user');
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };

    requestAnimationFrame(countFrames);
  }

  /**
   * Process navigation timing
   */
  private processNavigationTiming(entry: PerformanceNavigationTiming): void {
    this.addMetric('TTFB', entry.responseStart - entry.requestStart, 'ms', 'navigation');
    this.addMetric('DOMContentLoaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart, 'ms', 'navigation');
    this.addMetric('LoadComplete', entry.loadEventEnd - entry.loadEventStart, 'ms', 'navigation');
    this.addMetric('TotalLoadTime', entry.loadEventEnd - entry.fetchStart, 'ms', 'navigation');
  }

  /**
   * Process resource timing
   */
  private processResourceTiming(entry: PerformanceResourceTiming): void {
    const duration = entry.duration;
    const size = entry.transferSize || 0;
    
    this.addMetric('ResourceLoadTime', duration, 'ms', 'resource');
    this.addMetric('ResourceSize', size, 'bytes', 'resource');
  }

  /**
   * Process paint timing
   */
  private processPaintTiming(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-paint') {
      this.addMetric('FP', entry.startTime, 'ms', 'navigation');
    } else if (entry.name === 'first-contentful-paint') {
      this.addMetric('FCP', entry.startTime, 'ms', 'navigation');
    }
  }

  /**
   * Add custom metric
   */
  addMetric(name: string, value: number, unit: string, category: PerformanceMetric['category']): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      category
    };

    this.metrics.push(metric);
    this.checkThresholds(metric);
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.find(t => t.name === metric.name);
    if (!threshold) return;

    let violated = false;
    switch (threshold.operator) {
      case 'gt':
        violated = metric.value > threshold.threshold;
        break;
      case 'lt':
        violated = metric.value < threshold.threshold;
        break;
      case 'eq':
        violated = metric.value === threshold.threshold;
        break;
    }

    if (violated) {
      this.handleThresholdViolation(metric, threshold);
    }
  }

  /**
   * Handle threshold violation
   */
  private handleThresholdViolation(metric: PerformanceMetric, threshold: PerformanceThreshold): void {
    const message = `Performance threshold violated: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold.threshold}${metric.unit})`;
    
    switch (threshold.severity) {
      case 'warning':
        console.warn(message);
        break;
      case 'error':
        console.error(message);
        break;
      case 'critical':
        console.error('CRITICAL: ' + message);
        // Could trigger alerts or notifications here
        break;
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): PerformanceReport {
    const violations = this.getThresholdViolations();
    const recommendations = this.generateRecommendations();

    return {
      metrics: [...this.metrics],
      violations,
      recommendations,
      timestamp: Date.now()
    };
  }

  /**
   * Get threshold violations
   */
  private getThresholdViolations(): PerformanceThreshold[] {
    const violations: PerformanceThreshold[] = [];
    
    this.thresholds.forEach(threshold => {
      const metric = this.metrics.find(m => m.name === threshold.name);
      if (!metric) return;

      let violated = false;
      switch (threshold.operator) {
        case 'gt':
          violated = metric.value > threshold.threshold;
          break;
        case 'lt':
          violated = metric.value < threshold.threshold;
          break;
        case 'eq':
          violated = metric.value === threshold.threshold;
          break;
      }

      if (violated) {
        violations.push(threshold);
      }
    });

    return violations;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 60000); // Last minute

    // Check for slow resource loads
    const slowResources = recentMetrics.filter(m => m.name === 'ResourceLoadTime' && m.value > 1000);
    if (slowResources.length > 0) {
      recommendations.push('Consider optimizing resource loading - some resources are taking over 1 second to load');
    }

    // Check for low frame rate
    const lowFPS = recentMetrics.filter(m => m.name === 'FPS' && m.value < 30);
    if (lowFPS.length > 0) {
      recommendations.push('Frame rate is below 30 FPS - consider optimizing animations and heavy computations');
    }

    // Check for high memory usage
    const highMemory = recentMetrics.filter(m => m.name === 'MemoryUsed' && m.value > 100);
    if (highMemory.length > 0) {
      recommendations.push('Memory usage is high (>100MB) - check for memory leaks');
    }

    return recommendations;
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Get latest metric by name
   */
  getLatestMetric(name: string): PerformanceMetric | null {
    const metrics = this.metrics.filter(m => m.name === name);
    if (metrics.length === 0) return null;
    
    return metrics.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(maxAge: number = 24 * 60 * 60 * 1000): void { // Default: 24 hours
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Add custom threshold
   */
  addThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.push(threshold);
  }

  /**
   * Remove threshold
   */
  removeThreshold(name: string): void {
    this.thresholds = this.thresholds.filter(t => t.name !== name);
  }

  /**
   * Disconnect observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * Get Web Vitals metrics
   */
  async getWebVitals(): Promise<Record<string, number>> {
    const vitals: Record<string, number> = {};

    // Get FCP
    const fcp = this.getLatestMetric('FCP');
    if (fcp) vitals.FCP = fcp.value;

    // Get LCP (would need to be measured separately)
    const lcp = this.getLatestMetric('LCP');
    if (lcp) vitals.LCP = lcp.value;

    // Get FID (would need to be measured separately)
    const fid = this.getLatestMetric('FID');
    if (fid) vitals.FID = fid.value;

    // Get CLS (would need to be measured separately)
    const cls = this.getLatestMetric('CLS');
    if (cls) vitals.CLS = cls.value;

    return vitals;
  }
} 