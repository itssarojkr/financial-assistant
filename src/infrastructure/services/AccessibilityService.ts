import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  largeTextMode: boolean;
  reduceMotion: boolean;
  voiceControlEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  soundEffectsEnabled: boolean;
  focusIndicatorsEnabled: boolean;
  keyboardNavigationEnabled: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: 'low' | 'medium' | 'high';
  timeout?: number;
}

/**
 * AccessibilityService for managing accessibility features
 * 
 * This service provides comprehensive accessibility support including
 * screen reader announcements, keyboard navigation, haptic feedback,
 * and visual accessibility features.
 */
export class AccessibilityService {
  private static instance: AccessibilityService;
  private isInitialized = false;
  private settings: AccessibilitySettings = {
    screenReaderEnabled: true,
    highContrastMode: false,
    largeTextMode: false,
    reduceMotion: false,
    voiceControlEnabled: false,
    hapticFeedbackEnabled: true,
    soundEffectsEnabled: true,
    focusIndicatorsEnabled: true,
    keyboardNavigationEnabled: true,
    colorBlindMode: 'none'
  };

  private announcementQueue: AccessibilityAnnouncement[] = [];
  private isAnnouncing = false;

  /**
   * Gets the singleton instance of AccessibilityService
   */
  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Initialize the accessibility service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load saved settings
      await this.loadSettings();
      
      // Apply accessibility settings
      await this.applySettings();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize screen reader support
      this.initializeScreenReader();
      
      this.isInitialized = true;
      console.log('Accessibility service initialized');
    } catch (error) {
      console.error('Failed to initialize accessibility service:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Load accessibility settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'accessibilitySettings' });
      if (value) {
        this.settings = { ...this.settings, ...JSON.parse(value) };
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    }
  }

  /**
   * Save accessibility settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await Preferences.set({
        key: 'accessibilitySettings',
        value: JSON.stringify(this.settings)
      });
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  }

  /**
   * Apply accessibility settings to the DOM
   */
  private async applySettings(): Promise<void> {
    const root = document.documentElement;
    
    // Apply high contrast mode
    if (this.settings.highContrastMode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply large text mode
    if (this.settings.largeTextMode) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Apply reduce motion
    if (this.settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Apply color blind mode
    root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    if (this.settings.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${this.settings.colorBlindMode}`);
    }
    
    // Apply focus indicators
    if (this.settings.focusIndicatorsEnabled) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }

  /**
   * Set up accessibility event listeners
   */
  private setupEventListeners(): void {
    // Keyboard navigation
    if (this.settings.keyboardNavigationEnabled) {
      document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }
    
    // Focus management
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    
    // Screen reader announcements
    if (this.settings.screenReaderEnabled) {
      this.setupScreenReaderAnnouncements();
    }
  }

  /**
   * Initialize screen reader support
   */
  private initializeScreenReader(): void {
    // Create live region for announcements
    let liveRegion = document.getElementById('accessibility-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
  }

  /**
   * Set up screen reader announcements
   */
  private setupScreenReaderAnnouncements(): void {
    // Monitor DOM changes for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const announcement = element.getAttribute('data-accessibility-announcement');
              if (announcement) {
                this.announce(announcement, 'medium');
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Handle keyboard navigation events
   */
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    // Skip if user is typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
      case 'Escape':
        this.handleEscape(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event);
        break;
    }
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    // Ensure focus is visible
    if (this.settings.focusIndicatorsEnabled) {
      document.documentElement.classList.add('focus-visible');
    }
  }

  /**
   * Handle element activation
   */
  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'BUTTON' || target.role === 'button') {
      event.preventDefault();
      target.click();
      
      // Provide haptic feedback
      if (this.settings.hapticFeedbackEnabled) {
        this.triggerHapticFeedback(ImpactStyle.Light);
      }
      
      // Announce action
      const label = target.getAttribute('aria-label') || target.textContent || 'Button activated';
      this.announce(label, 'medium');
    }
  }

  /**
   * Handle escape key
   */
  private handleEscape(event: KeyboardEvent): void {
    // Close modals or return to previous state
    const modals = document.querySelectorAll('[role="dialog"]');
    const openModal = Array.from(modals).find(modal => 
      modal.getAttribute('aria-hidden') !== 'true'
    );
    
    if (openModal) {
      event.preventDefault();
      const closeButton = openModal.querySelector('[aria-label*="close" i], [aria-label*="cancel" i]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  /**
   * Handle arrow key navigation
   */
  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle list navigation
    if (target.role === 'listitem' || target.closest('[role="list"]')) {
      const list = target.closest('[role="list"]');
      const items = Array.from(list?.querySelectorAll('[role="listitem"]') || []);
      const currentIndex = items.indexOf(target);
      
      let nextIndex = currentIndex;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        nextIndex = Math.max(currentIndex - 1, 0);
      }
      
      if (nextIndex !== currentIndex) {
        event.preventDefault();
        (items[nextIndex] as HTMLElement).focus();
      }
    }
  }

  /**
   * Handle focus in events
   */
  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    
    // Announce focused element
    if (this.settings.screenReaderEnabled) {
      const label = target.getAttribute('aria-label') || target.textContent || target.tagName;
      this.announce(`${label} focused`, 'low');
    }
    
    // Add focus indicator
    if (this.settings.focusIndicatorsEnabled) {
      target.classList.add('focus-visible');
    }
  }

  /**
   * Handle focus out events
   */
  private handleFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    
    // Remove focus indicator
    if (this.settings.focusIndicatorsEnabled) {
      target.classList.remove('focus-visible');
    }
  }

  /**
   * Announce message to screen reader
   */
  async announce(message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    if (!this.settings.screenReaderEnabled) return;

    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      timeout: priority === 'high' ? 5000 : 3000
    };

    this.announcementQueue.push(announcement);
    
    if (!this.isAnnouncing) {
      await this.processAnnouncementQueue();
    }
  }

  /**
   * Process announcement queue
   */
  private async processAnnouncementQueue(): Promise<void> {
    if (this.announcementQueue.length === 0) {
      this.isAnnouncing = false;
      return;
    }

    this.isAnnouncing = true;
    const announcement = this.announcementQueue.shift()!;
    
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion) {
      liveRegion.textContent = announcement.message;
      
      // Clear after timeout
      setTimeout(() => {
        liveRegion.textContent = '';
        this.processAnnouncementQueue();
      }, announcement.timeout || 3000);
    } else {
      this.processAnnouncementQueue();
    }
  }

  /**
   * Trigger haptic feedback
   */
  async triggerHapticFeedback(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
    if (!this.settings.hapticFeedbackEnabled) return;

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Failed to trigger haptic feedback:', error);
    }
  }

  /**
   * Play sound effect
   */
  async playSoundEffect(soundType: 'success' | 'error' | 'warning' | 'notification'): Promise<void> {
    if (!this.settings.soundEffectsEnabled) return;

    try {
      // Create audio context for sound effects
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency based on sound type
      switch (soundType) {
        case 'success':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          break;
        case 'warning':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          break;
        case 'notification':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          break;
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Failed to play sound effect:', error);
    }
  }

  /**
   * Update accessibility settings
   */
  async updateSettings(newSettings: Partial<AccessibilitySettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    await this.applySettings();
  }

  /**
   * Get current accessibility settings
   */
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  /**
   * Check if screen reader is active
   */
  isScreenReaderActive(): boolean {
    return this.settings.screenReaderEnabled;
  }

  /**
   * Check if high contrast mode is enabled
   */
  isHighContrastMode(): boolean {
    return this.settings.highContrastMode;
  }

  /**
   * Check if large text mode is enabled
   */
  isLargeTextMode(): boolean {
    return this.settings.largeTextMode;
  }

  /**
   * Check if reduce motion is enabled
   */
  isReduceMotionEnabled(): boolean {
    return this.settings.reduceMotion;
  }

  /**
   * Focus element by selector
   */
  focusElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }

  /**
   * Focus first interactive element
   */
  focusFirstInteractiveElement(): void {
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    if (interactiveElements.length > 0) {
      (interactiveElements[0] as HTMLElement).focus();
    }
  }

  /**
   * Create skip link for keyboard navigation
   */
  createSkipLink(targetId: string, text: string = 'Skip to main content'): void {
    // Remove existing skip link
    const existingSkipLink = document.getElementById('skip-link');
    if (existingSkipLink) {
      existingSkipLink.remove();
    }

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-link';
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 10000;
      border-radius: 4px;
    `;

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Set ARIA label on element
   */
  setAriaLabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label);
  }

  /**
   * Set ARIA described by on element
   */
  setAriaDescribedBy(element: HTMLElement, descriptionId: string): void {
    element.setAttribute('aria-describedby', descriptionId);
  }

  /**
   * Set ARIA expanded state on element
   */
  setAriaExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  }

  /**
   * Set ARIA hidden state on element
   */
  setAriaHidden(element: HTMLElement, hidden: boolean): void {
    element.setAttribute('aria-hidden', hidden.toString());
  }

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate luminance of a color
   */
  private getLuminance(color: string): number {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Apply gamma correction
    const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
  }

  /**
   * Check if contrast ratio meets accessibility standards
   */
  isContrastSufficient(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
} 