import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionFromRequest, clearSessionCookie } from '@/lib/session';

// GET /api/session -> Cek apakah user sedang aktif dalam sesi login
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

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

    // Jika user dinonaktifkan di DB
    const response = NextResponse.json({ authenticated: false, user: null });
    clearSessionCookie(response);
    return response;
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/session -> Logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesi berhasil diakhiri.',
  });
  clearSessionCookie(response);
  return response;
}

