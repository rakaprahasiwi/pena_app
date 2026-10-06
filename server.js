// server.js
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
// Tambahkan limit besar karena kita menerima upload foto (Base64 URL)
app.use(express.json({ limit: '50mb' }));

const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // Sesuaikan user DB
    password: '', // Sesuaikan password DB
    database: 'sim_atk_kejari'
});

// --- API MASTER ITEMS ---
app.get('/api/items', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM items ORDER BY updatedAt DESC');
    res.json(rows);
});

app.post('/api/items', async (req, res) => {
    const { id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt } = req.body;
    await db.query(
        'REPLACE INTO items (id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt]
    );
    res.json({ success: true });
});

app.delete('/api/items/:id', async (req, res) => {
    await db.query('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

// --- API BARANG MASUK ---
app.get('/api/masuk', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM transaksi_masuk ORDER BY tanggal DESC');
    res.json(rows);
});

app.post('/api/masuk', async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, sumberPengadaan, nomorDokumen, tanggal, dicatatOleh, keterangan } = req.body;

        // Insert transaksi masuk
        await conn.query(
            'INSERT INTO transaksi_masuk (id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, sumberPengadaan, nomorDokumen, tanggal, dicatatOleh, keterangan) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            [id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, sumberPengadaan, nomorDokumen, tanggal, dicatatOleh, keterangan]
        );
        // Tambah stok di master item
        await conn.query('UPDATE items SET stok = stok + ?, updatedAt = NOW() WHERE id = ?', [jumlah, itemId]);

        await conn.commit();
        res.json({ success: true });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// --- API BARANG KELUAR (KIOSK) ---
app.get('/api/keluar', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM transaksi_keluar ORDER BY tanggal DESC');
    res.json(rows);
});

app.post('/api/keluar', async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const tx = req.body;

        // Cek ketersediaan stok
        const [items] = await conn.query('SELECT stok, stokMinimum FROM items WHERE id = ? FOR UPDATE', [tx.itemId]);
        if (items.length === 0) throw new Error('Barang tidak ditemukan');
        if (items[0].stok < tx.jumlah) throw new Error('Stok tidak mencukupi');

        // Kurangi stok
        await conn.query('UPDATE items SET stok = stok - ?, updatedAt = NOW() WHERE id = ?', [tx.jumlah, tx.itemId]);

        // Simpan history pengambilan
        await conn.query(
            'INSERT INTO transaksi_keluar (id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, namaPengambil, nipPengambil, bidang, keperluan, fotoPengambil, tanggal, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [tx.id, tx.itemId, tx.kodeBarang, tx.namaBarang, tx.kategori, tx.satuan, tx.jumlah, tx.namaPengambil, tx.nipPengambil, tx.bidang, tx.keperluan, tx.fotoPengambil, tx.tanggal, tx.status]
        );

        const isLowStockNow = (items[0].stok - tx.jumlah) <= items[0].stokMinimum;
        await conn.commit();
        res.json({ success: true, isLowStockNow });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
});

// --- API PENGATURAN SATKER ---
app.get('/api/satker', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM pengaturan_satker WHERE id = 1');
    res.json(rows[0]);
});

app.post('/api/satker', async (req, res) => {
    const data = req.body;
    await db.query(
        'UPDATE pengaturan_satker SET namaKejari=?, instansiInduk=?, alamat=?, telepon=?, kota=?, namaKasubbag=?, nipKasubbag=?, jabatanKasubbag=?, namaPengelola=?, nipPengelola=?, jabatanPengelola=? WHERE id=1',
        [data.namaKejari, data.instansiInduk, data.alamat, data.telepon, data.kota, data.namaKasubbag, data.nipKasubbag, data.jabatanKasubbag, data.namaPengelola, data.nipPengelola, data.jabatanPengelola]
    );
    res.json({ success: true });
});

app.listen(3001, () => console.log('API Server berjalan di port 3001'));