import { Preferences } from '@capacitor/preferences';
import { StatusBar, Style } from '@capacitor/status-bar';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  errorColor: string;
  successColor: string;
  warningColor: string;
}

export interface ThemeSettings {
  currentTheme: string;
  autoSwitch: boolean;
  systemPreference: boolean;
  customColors: Record<string, string>;
}

/**
 * ThemeService for managing application themes and styling
 * 
 * This service handles theme switching, custom themes, and
 * system preference integration.
 */
export class ThemeService {
  private static instance: ThemeService;
  private isInitialized = false;
  private currentTheme: string = 'light';
  private settings: ThemeSettings = {
    currentTheme: 'light',
    autoSwitch: false,
    systemPreference: true,
    customColors: {}
  };

  private defaultThemes: ThemeConfig[] = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean light theme',
      isDark: false,
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
      surfaceColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#06b6d4',
      errorColor: '#ef4444',
      successColor: '#10b981',
      warningColor: '#f59e0b'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Elegant dark theme',
      isDark: true,
      primaryColor: '#60a5fa',
      secondaryColor: '#94a3b8',
      backgroundColor: '#0f172a',
      surfaceColor: '#1e293b',
      textColor: '#f1f5f9',
      accentColor: '#22d3ee',
      errorColor: '#f87171',
      successColor: '#34d399',
      warningColor: '#fbbf24'
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      description: 'Calming blue theme',
      isDark: false,
      primaryColor: '#1e40af',
      secondaryColor: '#475569',
      backgroundColor: '#f0f9ff',
      surfaceColor: '#e0f2fe',
      textColor: '#0f172a',
      accentColor: '#0891b2',
      errorColor: '#dc2626',
      successColor: '#059669',
      warningColor: '#d97706'
    },
    {
      id: 'green',
      name: 'Forest Green',
      description: 'Nature-inspired green theme',
      isDark: false,
      primaryColor: '#166534',
      secondaryColor: '#4b5563',
      backgroundColor: '#f0fdf4',
      surfaceColor: '#dcfce7',
      textColor: '#0f172a',
      accentColor: '#0d9488',
      errorColor: '#dc2626',
      successColor: '#059669',
      warningColor: '#d97706'
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      description: 'Luxurious purple theme',
      isDark: true,
      primaryColor: '#7c3aed',
      secondaryColor: '#a78bfa',
      backgroundColor: '#1e1b4b',
      surfaceColor: '#312e81',
      textColor: '#f3f4f6',
      accentColor: '#ec4899',
      errorColor: '#f87171',
      successColor: '#34d399',
      warningColor: '#fbbf24'
    }
  ];

  /**
   * Gets the singleton instance of ThemeService
   */
  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Initialize the theme service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load saved settings
      await this.loadSettings();
      
      // Apply current theme
      await this.applyTheme(this.settings.currentTheme);
      
      // Set up system preference listener if enabled
      if (this.settings.systemPreference) {
        this.setupSystemPreferenceListener();
      }

      this.isInitialized = true;
      console.log('Theme service initialized');
    } catch (error) {
      console.error('Failed to initialize theme service:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Load theme settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'themeSettings' });
      if (value) {
        this.settings = { ...this.settings, ...JSON.parse(value) };
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  }

  /**
   * Save theme settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await Preferences.set({
        key: 'themeSettings',
        value: JSON.stringify(this.settings)
      });
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  }

  /**
   * Apply a theme to the application
   */
  async applyTheme(themeId: string): Promise<void> {
    const theme = this.getTheme(themeId);
    if (!theme) {
      console.warn(`Theme not found: ${themeId}`);
      return;
    }

    this.currentTheme = themeId;
    this.settings.currentTheme = themeId;

    // Apply CSS variables
    this.applyCSSVariables(theme);

    // Update status bar
    await this.updateStatusBar(theme.isDark);

    // Save settings
    await this.saveSettings();

    // Dispatch theme change event
    this.dispatchThemeChangeEvent(theme);

    console.log(`Theme applied: ${theme.name}`);
  }

  /**
   * Apply CSS variables to document root
   */
  private applyCSSVariables(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-background', theme.backgroundColor);
    root.style.setProperty('--color-surface', theme.surfaceColor);
    root.style.setProperty('--color-text', theme.textColor);
    root.style.setProperty('--color-accent', theme.accentColor);
    root.style.setProperty('--color-error', theme.errorColor);
    root.style.setProperty('--color-success', theme.successColor);
    root.style.setProperty('--color-warning', theme.warningColor);
  }

  /**
   * Update status bar style based on theme
   */
  private async updateStatusBar(isDark: boolean): Promise<void> {
    try {
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light
      });
    } catch (error) {
      console.error('Failed to update status bar:', error);
    }
  }

  /**
   * Dispatch theme change event
   */
  private dispatchThemeChangeEvent(theme: ThemeConfig): void {
    const event = new CustomEvent('themechange', { detail: theme });
    window.dispatchEvent(event);
  }

  /**
   * Set up system preference listener
   */
  private setupSystemPreferenceListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (this.settings.systemPreference) {
        const themeId = e.matches ? 'dark' : 'light';
        this.applyTheme(themeId);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
  }

  /**
   * Get a specific theme by ID
   */
  getTheme(themeId: string): ThemeConfig | undefined {
    return this.defaultThemes.find(theme => theme.id === themeId);
  }

  /**
   * Get all default themes
   */
  getAllThemes(): ThemeConfig[] {
    return [...this.defaultThemes];
  }

  /**
   * Get current theme configuration
   */
  getCurrentTheme(): ThemeConfig | undefined {
    return this.getTheme(this.currentTheme);
  }

  /**
   * Set a new theme
   */
  async setTheme(themeId: string): Promise<void> {
    await this.applyTheme(themeId);
  }

  /**
   * Toggle between light and dark themes
   */
  async toggleTheme(): Promise<void> {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    await this.applyTheme(newTheme);
  }

  /**
   * Update theme settings
   */
  async updateSettings(newSettings: Partial<ThemeSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  /**
   * Get current theme settings
   */
  getSettings(): ThemeSettings {
    return { ...this.settings };
  }

  /**
   * Create a custom theme
   */
  async createCustomTheme(theme: Omit<ThemeConfig, 'id'>): Promise<string> {
    const customThemes = await this.getCustomThemes();
    const newId = `custom_${Date.now()}`;
    
    const newTheme: ThemeConfig = {
      ...theme,
      id: newId
    };

    customThemes.push(newTheme);
    await this.saveCustomThemes(customThemes);
    
    return newId;
  }

  /**
   * Get all custom themes
   */
  async getCustomThemes(): Promise<ThemeConfig[]> {
    try {
      const { value } = await Preferences.get({ key: 'customThemes' });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Failed to load custom themes:', error);
      return [];
    }
  }

  /**
   * Save custom themes to storage
   */
  private async saveCustomThemes(themes: ThemeConfig[]): Promise<void> {
    try {
      await Preferences.set({
        key: 'customThemes',
        value: JSON.stringify(themes)
      });
    } catch (error) {
      console.error('Failed to save custom themes:', error);
    }
  }

  /**
   * Delete a custom theme
   */
  async deleteCustomTheme(themeId: string): Promise<void> {
    const customThemes = await this.getCustomThemes();
    const filteredThemes = customThemes.filter(theme => theme.id !== themeId);
    await this.saveCustomThemes(filteredThemes);
  }

  /**
   * Get all themes including custom ones
   */
  async getAllThemesWithCustom(): Promise<ThemeConfig[]> {
    const customThemes = await this.getCustomThemes();
    return [...this.defaultThemes, ...customThemes];
  }

  /**
   * Check if current theme is dark mode
   */
  isDarkMode(): boolean {
    const theme = this.getCurrentTheme();
    return theme?.isDark ?? false;
  }

  /**
   * Get contrast color for a background color
   */
  getContrastColor(backgroundColor: string): string {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  /**
   * Animate theme transition
   */
  async animateThemeTransition(duration: number = 300): Promise<void> {
    const root = document.documentElement;
    root.style.transition = `all ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      root.style.transition = '';
    }, duration);
  }

  /**
   * Export theme settings
   */
  async exportThemeSettings(): Promise<string> {
    const settings = {
      settings: this.settings,
      customThemes: await this.getCustomThemes()
    };
    
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import theme settings
   */
  async importThemeSettings(data: string): Promise<void> {
    try {
      const imported = JSON.parse(data);
      
      if (imported.settings) {
        this.settings = { ...this.settings, ...imported.settings };
        await this.saveSettings();
      }
      
      if (imported.customThemes) {
        await this.saveCustomThemes(imported.customThemes);
      }
    } catch (error) {
      console.error('Failed to import theme settings:', error);
      throw error;
    }
  }
} 