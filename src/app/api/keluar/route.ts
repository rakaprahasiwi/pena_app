import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM transaksi_keluar ORDER BY tanggal DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching transaksi keluar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const tx = await req.json();

    // Cek ketersediaan stok
    const [items]: any = await conn.query(
      'SELECT stok, stokMinimum FROM items WHERE id = ? FOR UPDATE',
      [tx.itemId]
    );

    if (items.length === 0) {
      throw new Error('Barang tidak ditemukan');
    }
    if (items[0].stok < tx.jumlah) {
      throw new Error('Stok tidak mencukupi');
    }

    // Kurangi stok
    await conn.query('UPDATE items SET stok = stok - ?, updatedAt = NOW() WHERE id = ?', [
      tx.jumlah,
      tx.itemId,
    ]);

    // Simpan history pengambilan
    await conn.query(
      'INSERT INTO transaksi_keluar (id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, namaPengambil, nipPengambil, bidang, keperluan, fotoPengambil, tanggal, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        tx.id,
        tx.itemId,
        tx.kodeBarang,
        tx.namaBarang,
        tx.kategori,
        tx.satuan,
        tx.jumlah,
        tx.namaPengambil,
        tx.nipPengambil,
        tx.bidang,
        tx.keperluan,
        tx.fotoPengambil,
        tx.tanggal,
        tx.status,
      ]
    );

    const isLowStockNow = items[0].stok - tx.jumlah <= items[0].stokMinimum;
    await conn.commit();
    return NextResponse.json({ success: true, isLowStockNow });
  } catch (err: any) {
    await conn.rollback();
    console.error('Error creating transaksi keluar:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

