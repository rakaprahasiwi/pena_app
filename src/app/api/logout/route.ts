import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil logout.',
  });
  clearSessionCookie(response);
  return response;
}

export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil logout.',
  });
  clearSessionCookie(response);
  return response;
}

