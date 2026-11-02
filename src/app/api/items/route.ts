import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM items ORDER BY updatedAt DESC",
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching items:", error);
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
      isEdit,
    } = body;

    // 1. Cek apakah kodeBarang sudah dipakai oleh barang lain (id berbeda)
    const [existingCode]: any = await db.query(
      "SELECT id, namaBarang FROM items WHERE LOWER(kodeBarang) = LOWER(?) AND id != ?",
      [kodeBarang.trim(), id],
    );

    if (existingCode && existingCode.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Kode barang "${kodeBarang}" sudah digunakan oleh "${existingCode[0].namaBarang}". Gunakan kode lain!`,
        },
        { status: 400 },
      );
    }

    // 2. Jika mode Edit, lakukan UPDATE berdasarkan id
    if (isEdit) {
      await db.query(
        `UPDATE items 
         SET kodeBarang=?, namaBarang=?, kategori=?, satuan=?, stok=?, stokMinimum=?, lokasiRak=?, spesifikasi=?, updatedAt=? 
         WHERE id=?`,
        [
          kodeBarang.trim(),
          namaBarang.trim(),
          kategori,
          satuan,
          stok,
          stokMinimum,
          lokasiRak,
          spesifikasi || null,
          updatedAt,
          id,
        ],
      );
    } else {
      // 3. Jika mode Tambah Baru, lakukan INSERT murni (bukan REPLACE INTO)
      await db.query(
        `INSERT INTO items (id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt) 
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          kodeBarang.trim(),
          namaBarang.trim(),
          kategori,
          satuan,
          stok,
          stokMinimum,
          lokasiRak,
          spesifikasi || null,
          updatedAt,
        ],
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error creating/updating item:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menyimpan data barang.",
      },
      { status: 500 },
    );
  }
}

//   await db.query(
//     'REPLACE INTO items (id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
//     [
//       id,
//       kodeBarang,
//       namaBarang,
//       kategori,
//       satuan,
//       stok,
//       stokMinimum,
//       lokasiRak,
//       spesifikasi,
//       updatedAt,
//     ]
//   );

//   return NextResponse.json({ success: true });
// } catch (error: any) {
//   console.error('Error creating/updating item:', error);
//   return NextResponse.json({ error: error.message }, { status: 500 });
// }
// }
