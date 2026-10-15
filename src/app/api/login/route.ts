import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import {
  createSessionToken,
  getSessionFromRequest,
  setSessionCookie,
  clearSessionCookie,
} from '@/lib/session';

// POST /api/login -> Verifikasi kredensial dan buat cookie session
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const [users]: any = await db.query(
      'SELECT id, username, role, namaLengkap, status FROM admin_users WHERE username = ? AND password = ? AND status = "aktif"',
      [username, password]
    );

    if (users && users.length > 0) {
      const user = users[0];
      const token = createSessionToken(user);

      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil.',
        user,
      });

      // Simpan session token ke HTTP-only cookie yang aman
      setSessionCookie(response, token);
      return response;
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Username atau password salah, atau akun dinonaktifkan.',
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/login -> Cek status session admin saat ini
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Verifikasi ulang ke database untuk memastikan akun masih aktif
    const [users]: any = await db.query(
      'SELECT id, username, role, namaLengkap, status FROM admin_users WHERE id = ? AND status = "aktif"',
      [session.userId]
    );

    if (users && users.length > 0) {
      return NextResponse.json({
        authenticated: true,
        user: users[0],
      });
    }

    // Jika akun sudah dinonaktifkan atau dihapus dari DB, bersihkan session
    const response = NextResponse.json({ authenticated: false, user: null });
    clearSessionCookie(response);
    return response;
  } catch (error: any) {
    console.error('Error checking login session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/login -> Logout dan hapus cookie session
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil keluar dari sesi admin.',
  });
  clearSessionCookie(response);
  return response;
}
