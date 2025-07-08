import { Camera, CameraResultType, CameraSource, ImageOptions } from '@capacitor/camera';

export interface ReceiptData {
  id: string;
  imageUrl: string;
  amount?: number;
  merchant?: string;
  date?: Date;
  category?: string;
  notes?: string;
}

/**
 * CameraService for handling camera operations and image processing
 * 
 * This service provides camera functionality for taking photos,
 * selecting images from gallery, and processing receipt images.
 */
export class CameraService {
  private static instance: CameraService;
  private isInitialized = false;

  /**
   * Gets the singleton instance of CameraService
   */
  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Initialize the camera service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check camera permissions
      const permission = await Camera.checkPermissions();
      console.log('Camera permission:', permission);

      if (permission.camera === 'prompt') {
        const request = await Camera.requestPermissions();
        console.log('Camera permission request:', request);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize camera:', error);
    }
  }

  /**
   * Take a photo using the camera
   */
  async takeReceiptPhoto(): Promise<ReceiptData | null> {
    try {
      const options: ImageOptions = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        width: 1920,
        height: 1080
      };

      const image = await Camera.getPhoto(options);
      
      if (image.webPath) {
        const receiptData: ReceiptData = {
          id: `receipt_${Date.now()}`,
          imageUrl: image.webPath,
          date: new Date()
        };

        return receiptData;
      }

      return null;
    } catch (error) {
      console.error('Failed to take receipt photo:', error);
      return null;
    }
  }

  /**
   * Select an image from the gallery
   */
  async selectReceiptFromGallery(): Promise<ReceiptData | null> {
    try {
      const options: ImageOptions = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        width: 1920,
        height: 1080
      };

      const image = await Camera.getPhoto(options);
      
      if (image.webPath) {
        const receiptData: ReceiptData = {
          id: `receipt_${Date.now()}`,
          imageUrl: image.webPath,
          date: new Date()
        };

        return receiptData;
      }

      return null;
    } catch (error) {
      console.error('Failed to select receipt from gallery:', error);
      return null;
    }
  }

  /**
   * Take a profile photo
   */
  async takeProfilePhoto(): Promise<string | null> {
    try {
      const options: ImageOptions = {
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        width: 400,
        height: 400
      };

      const image = await Camera.getPhoto(options);
      return image.webPath || null;
    } catch (error) {
      console.error('Failed to take profile photo:', error);
      return null;
    }
  }

  /**
   * Select a profile photo from gallery
   */
  async selectProfileFromGallery(): Promise<string | null> {
    try {
      const options: ImageOptions = {
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        width: 400,
        height: 400
      };

      const image = await Camera.getPhoto(options);
      return image.webPath || null;
    } catch (error) {
      console.error('Failed to select profile from gallery:', error);
      return null;
    }
  }

  /**
   * Extract data from receipt image using OCR (stub)
   */
  async extractReceiptData(imageUrl: string): Promise<Partial<ReceiptData>> {
    try {
      // STUB: Simulate OCR with fake data after a short delay
      await new Promise(res => setTimeout(res, 1200));
      return {
        merchant: 'Demo Store',
        amount: 42.99,
        date: new Date(),
        category: 'Food',
        notes: 'OCR simulated - replace with real integration.'
      };
    } catch (error) {
      console.error('Failed to extract receipt data:', error);
      return {};
    }
  }

  /**
   * Validate receipt image
   */
  async validateReceiptImage(imageUrl: string): Promise<boolean> {
    try {
      // Basic validation - check if image exists and has reasonable dimensions
      const img = new Image();
      img.src = imageUrl;
      
      return new Promise((resolve) => {
        img.onload = () => {
          const isValid = img.width > 100 && img.height > 100;
          resolve(isValid);
        };
        img.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Failed to validate receipt image:', error);
      return false;
    }
  }

  /**
   * Compress image for storage
   */
  async compressImage(imageUrl: string, quality: number = 0.8): Promise<string> {
    try {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const compressedUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedUrl);
          } else {
            resolve(imageUrl);
          }
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Failed to compress image:', error);
      return imageUrl;
    }
  }

  /**
   * Check if camera is available
   */
  async isCameraAvailable(): Promise<boolean> {
    try {
      const permission = await Camera.checkPermissions();
      return permission.camera === 'granted';
    } catch (error) {
      console.error('Failed to check camera availability:', error);
      return false;
    }
  }

  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const permission = await Camera.requestPermissions();
      return permission.camera === 'granted';
    } catch (error) {
      console.error('Failed to request camera permissions:', error);
      return false;
    }
  }
} 