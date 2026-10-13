import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const [users]: any = await db.query(
      'SELECT id, username, role, namaLengkap, status FROM admin_users WHERE username = ? AND password = ? AND status = "aktif"',
      [username, password]
    );

    if (users && users.length > 0) {
      return NextResponse.json({ success: true, user: users[0] });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Username atau password salah, atau akun dinonaktifkan.',
      });
    }
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

