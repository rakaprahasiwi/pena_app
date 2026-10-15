import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { AdminUser } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || 'pena-kejaksaan-secret-key-32chars-min!!';
export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 jam (dalam detik)

export interface SessionPayload {
  userId: number;
  username: string;
  role: 'superadmin' | 'admin';
  namaLengkap: string;
  expiresAt: number;
}

/**
 * Membuat signed session token (HMAC-SHA256)
 */
export function createSessionToken(user: AdminUser): string {
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    namaLengkap: user.namaLengkap,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const dataStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(dataStr)
    .digest('base64url');

  return `${dataStr}.${signature}`;
}

/**
 * Memverifikasi integritas dan masa berlaku signed session token
 */
export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token || !token.includes('.')) return null;

  const [dataStr, signature] = token.split('.');
  if (!dataStr || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(dataStr)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null; // Tanda tangan tidak cocok (tampered)
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(dataStr, 'base64url').toString('utf-8')
    );

    if (Date.now() > payload.expiresAt) {
      return null; // Token telah kadaluarsa
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Mengambil session dari NextRequest
 */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Menempelkan cookie session ke NextResponse
 */
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Menghapus cookie session dari NextResponse
 */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

