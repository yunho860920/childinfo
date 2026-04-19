import CryptoJS from 'crypto-js';

// Site-wide secret key for local obfuscation/encryption.
// For a production app with Auth, this would be derived from a user's pin/password.
const SECRET_KEY = 'grav-childinfo-vault-2024';

/**
 * Encrypts data and saves to localStorage
 */
export const saveSecureData = (key, data) => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
    return true;
  } catch (error) {
    console.error('Security Error (Encryption):', error);
    return false;
  }
};

/**
 * Loads encrypted data from localStorage and decrypts it
 */
export const loadSecureData = (key, defaultValue = null) => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return defaultValue;

    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedData) return defaultValue;
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Security Error (Decryption):', error);
    return defaultValue;
  }
};
