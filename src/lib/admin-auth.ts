// Web Crypto API based secure token signing and verification for Admin Authentication
// Compatible with Next.js Middleware (Edge Runtime) and Node.js Server Actions

const DEFAULT_SECRET = "oslo_elite_hotel_admin_secret_key_v1_2026_secure_token";

function getSecretKey(): string {
  return process.env.ADMIN_AUTH_SECRET || DEFAULT_SECRET;
}

export function getExpectedAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
  };
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface AdminTokenPayload {
  u: string; // username
  iat: number; // issued at (ms)
  exp: number; // expires at (ms)
}

/**
 * Sign an admin session token valid for the specified duration (default 24 hours)
 */
export async function signAdminToken(username: string, maxAgeMs = 24 * 60 * 60 * 1000): Promise<string> {
  const now = Date.now();
  const payload: AdminTokenPayload = {
    u: username,
    iat: now,
    exp: now + maxAgeMs,
  };

  const payloadStr = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payloadStr);
  const payloadB64 = base64UrlEncode(payloadBytes);

  const key = await getCryptoKey(getSecretKey());
  const dataToSign = encoder.encode(payloadB64);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
  const signatureB64 = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verify an admin session token. Returns null if invalid or expired.
 */
export async function verifyAdminToken(token: string | null | undefined): Promise<AdminTokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;

  try {
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(payloadB64);
    const signatureBytes = base64UrlDecode(signatureB64);

    const key = await getCryptoKey(getSecretKey());
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes as unknown as ArrayBuffer, dataToVerify);

    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const decoder = new TextDecoder();
    const payloadStr = decoder.decode(payloadBytes);
    const payload: AdminTokenPayload = JSON.parse(payloadStr);

    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = "oslo_admin_session";
