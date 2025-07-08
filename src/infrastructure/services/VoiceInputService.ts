import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export interface VoiceCommand {
  command: string;
  action: string;
  parameters: Record<string, unknown>;
  confidence: number;
}

export interface VoiceSettings {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammar?: string;
}

export class VoiceInputService {
  private static instance: VoiceInputService;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private isSpeaking = false;
  private settings: VoiceSettings = {
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1
  };
  private onResultCallback?: (result: VoiceRecognitionResult) => void;
  private onCommandCallback?: (command: VoiceCommand) => void;
  private onErrorCallback?: (error: string) => void;

  static getInstance(): VoiceInputService {
    if (!VoiceInputService.instance) {
      VoiceInputService.instance = new VoiceInputService();
    }
    return VoiceInputService.instance;
  }

  /**
   * Initialize voice input service
   */
  async initialize(): Promise<void> {
    try {
      // Check for speech recognition support
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
        this.recognition = new (window as unknown as { SpeechRecognition: typeof SpeechRecognition }).SpeechRecognition();
      } else {
        throw new Error('Speech recognition not supported');
      }

      // Check for speech synthesis support
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }

      this.setupRecognition();
      console.log('Voice input service initialized');
    } catch (error) {
      console.error('Failed to initialize voice input service:', error);
      throw error;
    }
  }

  /**
   * Setup speech recognition
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.lang = this.settings.language;
    this.recognition.continuous = this.settings.continuous;
    this.recognition.interimResults = this.settings.interimResults;
    this.recognition.maxAlternatives = this.settings.maxAlternatives;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      const voiceResult: VoiceRecognitionResult = {
        transcript,
        confidence,
        isFinal,
        timestamp: Date.now()
      };

      if (this.onResultCallback) {
        this.onResultCallback(voiceResult);
      }

      if (isFinal) {
        this.processCommand(transcript, confidence);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      const errorMessage = this.getErrorMessage(event.error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
      
      console.error('Speech recognition error:', errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Voice recognition ended');
    };
  }

  /**
   * Process voice command
   */
  private processCommand(transcript: string, confidence: number): void {
    const command = this.parseCommand(transcript);
    
    if (command && this.onCommandCallback) {
      this.onCommandCallback(command);
    }
  }

  /**
   * Parse voice command
   */
  private parseCommand(transcript: string): VoiceCommand | null {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Add expense command
    if (lowerTranscript.includes('add expense') || lowerTranscript.includes('new expense')) {
      const amount = this.extractAmount(lowerTranscript);
      const category = this.extractCategory(lowerTranscript);
      
      return {
        command: 'add_expense',
        action: 'Add new expense',
        parameters: {
          amount,
          category,
          description: transcript
        },
        confidence: 0.8
      };
    }

    // Show expenses command
    if (lowerTranscript.includes('show expenses') || lowerTranscript.includes('list expenses')) {
      return {
        command: 'show_expenses',
        action: 'Show expenses list',
        parameters: {},
        confidence: 0.9
      };
    }

    // Calculate tax command
    if (lowerTranscript.includes('calculate tax') || lowerTranscript.includes('tax calculation')) {
      const amount = this.extractAmount(lowerTranscript);
      
      return {
        command: 'calculate_tax',
        action: 'Calculate tax',
        parameters: {
          amount
        },
        confidence: 0.8
      };
    }

    // Help command
    if (lowerTranscript.includes('help') || lowerTranscript.includes('what can you do')) {
      return {
        command: 'help',
        action: 'Show help',
        parameters: {},
        confidence: 0.9
      };
    }

    return null;
  }

  /**
   * Extract amount from transcript
   */
  private extractAmount(transcript: string): number | null {
    const amountRegex = /(\d+(?:\.\d{1,2})?)/;
    const match = transcript.match(amountRegex);
    return match ? parseFloat(match[1]) : null;
  }

  /**
   * Extract category from transcript
   */
  private extractCategory(transcript: string): string | null {
    const categories = [
      'food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'education'
    ];
    
    for (const category of categories) {
      if (transcript.includes(category)) {
        return category;
      }
    }
    
    return null;
  }

  /**
   * Get error message from speech recognition error
   */
  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.';
      case 'network':
        return 'Network error occurred. Please check your connection.';
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.';
      case 'bad-grammar':
        return 'Speech recognition grammar error.';
      case 'language-not-supported':
        return 'Language not supported.';
      default:
        return `Speech recognition error: ${error}`;
    }
  }

  /**
   * Start listening for voice input
   */
  startListening(): void {
    if (!this.recognition || this.isListening) return;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback('Failed to start voice recognition');
      }
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  }

  /**
   * Speak text using speech synthesis
   */
  speak(text: string, options?: { voice?: string; rate?: number; pitch?: number }): void {
    if (!this.synthesis || this.isSpeaking) return;

    try {
      this.synthesis.cancel(); // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.settings.language;
      
      if (options?.voice) {
        utterance.voice = this.getVoice(options.voice);
      }
      
      if (options?.rate) {
        utterance.rate = options.rate;
      }
      
      if (options?.pitch) {
        utterance.pitch = options.pitch;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error('Speech synthesis error:', event.error);
      };

      this.synthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak text:', error);
    }
  }

  /**
   * Get voice by name
   */
  private getVoice(name: string): SpeechSynthesisVoice | null {
    if (!this.synthesis) return null;

    const voices = this.synthesis.getVoices();
    return voices.find(voice => voice.name === name) || null;
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Update voice settings
   */
  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    if (this.recognition) {
      this.recognition.lang = this.settings.language;
      this.recognition.continuous = this.settings.continuous;
      this.recognition.interimResults = this.settings.interimResults;
      this.recognition.maxAlternatives = this.settings.maxAlternatives;
    }
  }

  /**
   * Get current settings
   */
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  /**
   * Set result callback
   */
  onResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set command callback
   */
  onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandCallback = callback;
  }

  /**
   * Set error callback
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Check if voice input is supported
   */
  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if currently speaking
   */
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): string[] {
    const voices = this.getAvailableVoices();
    const languages = new Set<string>();
    
    voices.forEach(voice => {
      if (voice.lang) {
        languages.add(voice.lang);
      }
    });
    
    return Array.from(languages).sort();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopListening();
    this.stopSpeaking();
    
    if (this.recognition) {
      this.recognition.abort();
    }
    
    this.onResultCallback = undefined;
    this.onCommandCallback = undefined;
    this.onErrorCallback = undefined;
  }
} 