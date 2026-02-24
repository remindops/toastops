import crypto from 'node:crypto';

// Strong recommendation: Users must inject this exact key in production
// Since this is a local setup MVP, we fallback to a hardcoded 32-byte (256-bit) buffer if omitted
const ENV_SECRET = process.env.ENCRYPTION_SECRET;
const KMS_SECRET_KEY = ENV_SECRET
  ? (ENV_SECRET.length === 64 ? Buffer.from(ENV_SECRET, 'hex') : Buffer.from(ENV_SECRET, 'base64'))
  : crypto.scryptSync('toastops-local-dev-secret-only', 'salt', 32);

const ALGORITHM = 'aes-256-gcm';

export interface EncryptedPayload {
  encryptedApiKey: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts a raw API string (e.g. "sk-abc1234") into a KMS Payload.
 * Utilizes AES-256-GCM for authenticated enterprise-grade encryption.
 */
export function encryptApiKey(apiKey: string): EncryptedPayload {
  const iv = crypto.randomBytes(12); // Recommended 12 bytes for GCM

  const cipher = crypto.createCipheriv(ALGORITHM, KMS_SECRET_KEY, iv);

  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedApiKey: encrypted,
    iv: iv.toString('hex'),
    authTag
  };
}

/**
 * Decrypts an encrypted payload back into a raw string momentarily in RAM.
 */
export function decryptApiKey(payload: EncryptedPayload): string {
  const ivBuffer = Buffer.from(payload.iv, 'hex');
  const authTagBuffer = Buffer.from(payload.authTag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, KMS_SECRET_KEY, ivBuffer);
  decipher.setAuthTag(authTagBuffer);

  let decrypted = decipher.update(payload.encryptedApiKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
