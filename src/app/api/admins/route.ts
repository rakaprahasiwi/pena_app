import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya superadmin yang dapat mengakses data ini.' },
        { status: 403 }
      );
    }

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
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya superadmin yang dapat menambah admin.' },
        { status: 403 }
      );
    }

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
