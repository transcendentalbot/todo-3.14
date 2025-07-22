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

    // Derive key from password using PBKDF2
    const key = CryptoJS.PBKDF2(password, this.salt, {
      keySize: 256 / 32,
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256
    });

    this.encryptionKey = key.toString();
  }

  /**
   * Check if encryption is initialized
   */
  isInitialized(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Encrypt data
   */
  encrypt(data: any): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized. Call initialize() first.');
    }

    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey);
    return encrypted.toString();
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData: string): any {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized. Call initialize() first.');
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data. Invalid key or corrupted data.');
    }
  }

  /**
   * Clear encryption key (on logout)
   */
  clear(): void {
    this.encryptionKey = null;
    // Keep salt for next login
  }

  /**
   * Completely reset encryption (new device/forgot password)
   */
  reset(): void {
    this.encryptionKey = null;
    this.salt = null;
    localStorage.removeItem('encryption_salt');
  }
}

export default EncryptionService.getInstance();