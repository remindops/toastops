import { SignJWT, jwtVerify } from 'jose';

// Secret key for signing the JSON Web Token. 
// Uses generic random local key if ENCRYPTION_SECRET not supplied.
const JWT_SECRET = new TextEncoder().encode(
    process.env.ENCRYPTION_SECRET || 'fallback-dev-jwt-secret-very-long-string-123'
);
const ALG = 'HS256';

export interface JwtPayload {
  userId: string;
  organizationId: string;
  [key: string]: any;
}

/**
 * Creates a signed DIY JSON Web Token for stateless explicit authentication.
 */
export async function createSessionToken(payload: JwtPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    // Session valid for 7 days
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
    
  return jwt;
}

/**
 * Verifies and parses the DIY JSON Web Token securely.
 */
export async function verifySessionToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JwtPayload;
  } catch (err) {
    // Return null explicitly if invalid, expired, or tampered.
    return null;
  }
}

/**
 * Simple bcrypt-style mock or lightweight password hash verification
 * For MVP without massive dependencies, utilizing native crypto 
 * (In production, replace with argon2 or bcrypt standard explicitly).
 * Using simple SHA-256 with salt for our DIY explicitly defined auth.
 */
import crypto from 'node:crypto';

export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return newHash === hash;
}
