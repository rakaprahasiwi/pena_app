import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { username, role, namaLengkap, status, password } = await req.json();

    if (password && password.trim() !== '') {
      await db.query(
        'UPDATE admin_users SET username=?, password=?, role=?, namaLengkap=?, status=? WHERE id=?',
        [username, password, role, namaLengkap, status, id]
      );
    } else {
      await db.query(
        'UPDATE admin_users SET username=?, role=?, namaLengkap=?, status=? WHERE id=?',
        [username, role, namaLengkap, status, id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.query('DELETE FROM admin_users WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

