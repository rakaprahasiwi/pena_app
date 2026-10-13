import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM pengaturan_satker WHERE id = 1');
    return NextResponse.json(rows[0] || null);
  } catch (error: any) {
    console.error('Error fetching satker:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await db.query(
      'UPDATE pengaturan_satker SET namaKejari=?, instansiInduk=?, alamat=?, telepon=?, kota=?, namaKasubbag=?, nipKasubbag=?, jabatanKasubbag=?, namaPengelola=?, nipPengelola=?, jabatanPengelola=? WHERE id=1',
      [
        data.namaKejari,
        data.instansiInduk,
        data.alamat,
        data.telepon,
        data.kota,
        data.namaKasubbag,
        data.nipKasubbag,
        data.jabatanKasubbag,
        data.namaPengelola,
        data.nipPengelola,
        data.jabatanPengelola,
      ]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating satker:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

