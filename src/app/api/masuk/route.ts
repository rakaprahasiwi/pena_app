import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM transaksi_masuk ORDER BY tanggal DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching transaksi masuk:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const body = await req.json();
    const {
      id,
      itemId,
      kodeBarang,
      namaBarang,
      kategori,
      satuan,
      jumlah,
      tanggal,
      dicatatOleh,
      keterangan,
    } = body;

    // Insert transaksi masuk
    await conn.query(
      'INSERT INTO transaksi_masuk (id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, tanggal, dicatatOleh, keterangan) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [
        id,
        itemId,
        kodeBarang,
        namaBarang,
        kategori,
        satuan,
        jumlah,
        tanggal,
        dicatatOleh,
        keterangan,
      ]
    );

    // Tambah stok di master item
    await conn.query('UPDATE items SET stok = stok + ?, updatedAt = NOW() WHERE id = ?', [
      jumlah,
      itemId,
    ]);

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    await conn.rollback();
    console.error('Error creating transaksi masuk:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

