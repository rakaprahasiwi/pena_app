import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM items ORDER BY updatedAt DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      kodeBarang,
      namaBarang,
      kategori,
      satuan,
      stok,
      stokMinimum,
      lokasiRak,
      spesifikasi,
      updatedAt,
    } = body;

    await db.query(
      'REPLACE INTO items (id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [
        id,
        kodeBarang,
        namaBarang,
        kategori,
        satuan,
        stok,
        stokMinimum,
        lokasiRak,
        spesifikasi,
        updatedAt,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating/updating item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

