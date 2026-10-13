import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(
      'SELECT id, username, role, namaLengkap, status, createdAt FROM admin_users ORDER BY role DESC, createdAt ASC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password, role, namaLengkap, status } = await req.json();
    await db.query(
      'INSERT INTO admin_users (username, password, role, namaLengkap, status) VALUES (?,?,?,?,?)',
      [username, password, role, namaLengkap, status || 'aktif']
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.code === 'ER_DUP_ENTRY' ? 'Username sudah digunakan' : error.message,
      },
      { status: 500 }
    );
  }
}

