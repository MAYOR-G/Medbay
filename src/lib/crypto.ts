import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const AES_ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

function parseEncryptionKey(hexSecret: string): Buffer {
  if (!/^[0-9a-fA-F]{64}$/.test(hexSecret)) {
    throw new Error("Encryption secret must be a 64-character hex string (32 bytes).");
  }
  return Buffer.from(hexSecret, "hex");
}

/**
 * Encrypts sensitive OAuth refresh tokens using AES-256-GCM with a unique 12-byte IV.
 */
export function encryptSecret(plaintext: string, hexSecret: string): string {
  const key = parseEncryptionKey(hexSecret);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(AES_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

/**
 * Decrypts AES-256-GCM payloads produced by encryptSecret.
 */
export function decryptSecret(encodedPayload: string, hexSecret: string): string {
  const key = parseEncryptionKey(hexSecret);
  const raw = Buffer.from(encodedPayload, "base64url");
  if (raw.length <= IV_BYTES + AUTH_TAG_BYTES) {
    throw new Error("Malformed encrypted payload.");
  }

  const iv = raw.subarray(0, IV_BYTES);
  const authTag = raw.subarray(IV_BYTES, IV_BYTES + AUTH_TAG_BYTES);
  const ciphertext = raw.subarray(IV_BYTES + AUTH_TAG_BYTES);

  const decipher = createDecipheriv(AES_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Generates a 192-bit (24 random bytes) URL-safe share token.
 */
export function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}
