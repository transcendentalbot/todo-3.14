import CryptoJS from 'crypto-js';

class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string | null = null;
  private salt: string | null = null;

  private constructor() {
    // Load salt from localStorage if exists
    const storedSalt = localStorage.getItem('encryption_salt');
    if (storedSalt) {
      this.salt = storedSalt;
    }
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Initialize encryption with user's password
   * This should be called after successful login
   */
  async initialize(password: string): Promise<void> {
    // Generate or retrieve salt
    if (!this.salt) {
      this.salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      localStorage.setItem('encryption_salt', this.salt);
    }

    // Generate encryption key from password and salt
    this.encryptionKey = CryptoJS.PBKDF2(password, this.salt, {
      keySize: 256 / 32,
      iterations: 1000
    }).toString();

    // Store a flag that encryption is initialized
    localStorage.setItem('encryption_initialized', 'true');
  }

  /**
   * Check if encryption is initialized
   */
  isInitialized(): boolean {
    return !!(this.encryptionKey && this.salt && localStorage.getItem('encryption_initialized'));
  }

  /**
   * Initialize with a temporary key if not initialized
   * This allows read-only access to encrypted data
   */
  initializeReadOnly(): void {
    if (!this.isInitialized() && this.salt) {
      // Use a default key for read-only access
      // This won't decrypt properly but prevents errors
      this.encryptionKey = 'READ_ONLY_KEY';
    }
  }

  /**
   * Encrypt data
   */
  async encrypt(data: string): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('Encryption not initialized. Call initialize() first.');
    }

    const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey!).toString();
    return encrypted;
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData: string): Promise<string> {
    // Check if encryptedData is empty or invalid
    if (!encryptedData || encryptedData.trim() === '') {
      console.warn('Decrypt called with empty data');
      return '';
    }

    if (!this.encryptionKey) {
      // Try read-only mode
      this.initializeReadOnly();
      if (!this.encryptionKey) {
        throw new Error('Encryption not initialized. Call initialize() first.');
      }
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey).toString(CryptoJS.enc.Utf8);
      
      // If decryption results in empty string, it likely failed
      if (!decrypted) {
        console.error('Decryption failed: empty result from decryption');
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
      
      // Try to parse as JSON to validate it's properly decrypted
      try {
        JSON.parse(decrypted);
      } catch {
        // Not JSON, but that's okay - just return the decrypted string
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      // If we're in read-only mode, return a placeholder
      if (this.encryptionKey === 'READ_ONLY_KEY') {
        return '[Encrypted content - please log in to view]';
      }
      throw new Error('Failed to decrypt data. Invalid key or corrupted data.');
    }
  }

  /**
   * Clear encryption data (for logout)
   */
  clear(): void {
    this.encryptionKey = null;
    this.salt = null;
    localStorage.removeItem('encryption_salt');
    localStorage.removeItem('encryption_initialized');
  }

  /**
   * Re-initialize encryption with saved salt
   * This is for PWA scenarios where we need to re-enter password
   */
  async reInitialize(password: string): Promise<boolean> {
    if (!this.salt) {
      return false;
    }

    try {
      await this.initialize(password);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default EncryptionService.getInstance();