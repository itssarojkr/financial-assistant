/**
 * UI Types
 * 
 * This module defines common types for UI components and user interactions
 * across the application. These types ensure consistency in user interface design.
 */

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

/**
 * Breakpoint types
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Orientation types
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * UI state interface
 */
export interface UIState {
  theme: Theme;
  colorScheme: ColorScheme;
  breakpoint: Breakpoint;
  deviceType: DeviceType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Form field interface
 */
export interface FormField<T = any> {
  name: string;
  value: T;
  error?: string;
  touched: boolean;
  required: boolean;
  disabled: boolean;
  placeholder?: string;
  label?: string;
  helpText?: string;
}

/**
 * Form state interface
 */
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

/**
 * Form validation rule interface
 */
export interface FormValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean | string;
}

/**
 * Form validation schema interface
 */
export interface FormValidationSchema {
  [fieldName: string]: FormValidationRule[];
}

/**
 * Modal state interface
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

/**
 * Toast notification interface
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  indeterminate: boolean;
}

/**
 * Error state interface
 */
export interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  code?: string;
  retry?: () => void;
}

/**
 * Navigation item interface
 */
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  disabled?: boolean;
  hidden?: boolean;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isCurrentPage?: boolean;
}

/**
 * Tab item interface
 */
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: string;
}

/**
 * Select option interface
 */
export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

/**
 * Data table column interface
 */
export interface DataTableColumn<T = unknown> {
  key: string;
  header: string;
  accessor: keyof T | ((item: T) => unknown);
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, item: T) => React.ReactNode;
}

/**
 * Data table state interface
 */
export interface DataTableState<T = unknown> {
  data: T[];
  columns: DataTableColumn<T>[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  sorting: {
    key: string;
    direction: 'asc' | 'desc';
  };
  filters: Record<string, unknown>;
  selection: string[];
  isLoading: boolean;
}

/**
 * Chart data point interface
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

/**
 * Chart configuration interface
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data: ChartDataPoint[];
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    animation?: boolean;
    plugins?: Record<string, unknown>;
  };
}

/**
 * File upload interface
 */
export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

/**
 * Drag and drop interface
 */
export interface DragDropState {
  isDragging: boolean;
  draggedItem?: any;
  dropTarget?: any;
  canDrop: boolean;
}

/**
 * Keyboard shortcut interface
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

/**
 * Accessibility interface
 */
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-checked'?: boolean;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  role?: string;
  tabIndex?: number;
}

/**
 * Focus management interface
 */
export interface FocusManager {
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
  focusElement: (element: HTMLElement) => void;
  trapFocus: (container: HTMLElement) => void;
  releaseFocus: () => void;
}

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount?: number | 'infinite';
}

/**
 * Responsive breakpoints configuration
 */
export interface ResponsiveBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

/**
 * Component variant interface
 */
export interface ComponentVariant {
  variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Event handler interface
 */
export interface EventHandler<T = Event> {
  (event: T): void | Promise<void>;
}

/**
 * Callback function interface
 */
export interface Callback<T = unknown> {
  (value: T): void | Promise<void>;
} 