import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables dari .env.local (prioritas) dan .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support Base64 image upload dari kiosk kamera

// Database Connection Pool via Environment
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'pena_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Helper: Async wrapper untuk eliminasi boilerplate try-catch
const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Helper: Transaksi database terisolasi
async function withTransaction(callback) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ======================= MASTER ITEMS =======================
app.get('/api/items', handle(async (_, res) => {
  const [rows] = await db.query('SELECT * FROM items ORDER BY updatedAt DESC');
  res.json(rows);
}));

app.post('/api/items', handle(async (req, res) => {
  const { id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt } = req.body;
  await db.query(
    'REPLACE INTO items (id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, kodeBarang, namaBarang, kategori, satuan, stok, stokMinimum, lokasiRak, spesifikasi, updatedAt]
  );
  res.json({ success: true });
}));

app.delete('/api/items/:id', handle(async (req, res) => {
  await db.query('DELETE FROM items WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

// ======================= BARANG MASUK =======================
app.get('/api/masuk', handle(async (_, res) => {
  const [rows] = await db.query('SELECT * FROM transaksi_masuk ORDER BY tanggal DESC');
  res.json(rows);
}));

app.post('/api/masuk', handle(async (req, res) => {
  const { id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, tanggal, dicatatOleh, keterangan } = req.body;
  await withTransaction(async (conn) => {
    await conn.query(
      'INSERT INTO transaksi_masuk (id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, tanggal, dicatatOleh, keterangan) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, tanggal, dicatatOleh, keterangan]
    );
    await conn.query('UPDATE items SET stok = stok + ?, updatedAt = NOW() WHERE id = ?', [jumlah, itemId]);
  });
  res.json({ success: true });
}));

// ======================= BARANG KELUAR (KIOSK) =======================
app.get('/api/keluar', handle(async (_, res) => {
  const [rows] = await db.query('SELECT * FROM transaksi_keluar ORDER BY tanggal DESC');
  res.json(rows);
}));

app.post('/api/keluar', handle(async (req, res) => {
  const tx = req.body;
  const result = await withTransaction(async (conn) => {
    const [items] = await conn.query('SELECT stok, stokMinimum FROM items WHERE id = ? FOR UPDATE', [tx.itemId]);
    if (!items.length) throw new Error('Barang tidak ditemukan');
    if (items[0].stok < tx.jumlah) throw new Error('Stok tidak mencukupi');

    await conn.query('UPDATE items SET stok = stok - ?, updatedAt = NOW() WHERE id = ?', [tx.jumlah, tx.itemId]);
    await conn.query(
      'INSERT INTO transaksi_keluar (id, itemId, kodeBarang, namaBarang, kategori, satuan, jumlah, namaPengambil, nipPengambil, bidang, keperluan, fotoPengambil, tanggal, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [tx.id, tx.itemId, tx.kodeBarang, tx.namaBarang, tx.kategori, tx.satuan, tx.jumlah, tx.namaPengambil, tx.nipPengambil, tx.bidang, tx.keperluan, tx.fotoPengambil, tx.tanggal, tx.status]
    );
    return { success: true, isLowStockNow: (items[0].stok - tx.jumlah) <= items[0].stokMinimum };
  });
  res.json(result);
}));

// ======================= PENGATURAN SATKER =======================
app.get('/api/satker', handle(async (_, res) => {
  const [rows] = await db.query('SELECT * FROM pengaturan_satker WHERE id = 1');
  res.json(rows[0] || null);
}));

app.post('/api/satker', handle(async (req, res) => {
  const d = req.body;
  await db.query(
    'UPDATE pengaturan_satker SET namaKejari=?, instansiInduk=?, alamat=?, telepon=?, kota=?, namaKasubbag=?, nipKasubbag=?, jabatanKasubbag=?, namaPengelola=?, nipPengelola=?, jabatanPengelola=? WHERE id=1',
    [d.namaKejari, d.instansiInduk, d.alamat, d.telepon, d.kota, d.namaKasubbag, d.nipKasubbag, d.jabatanKasubbag, d.namaPengelola, d.nipPengelola, d.jabatanPengelola]
  );
  res.json({ success: true });
}));

// ======================= LOGIN ADMIN =======================
app.post('/api/login', handle(async (req, res) => {
  const { username, password } = req.body;
  const [users] = await db.query(
    'SELECT id, username, role, namaLengkap, status FROM admin_users WHERE username = ? AND password = ? AND status = "aktif"',
    [username, password]
  );
  if (users.length) return res.json({ success: true, user: users[0] });
  res.status(401).json({ success: false, message: 'Username atau password salah, atau akun dinonaktifkan.' });
}));

// ======================= MANAJEMEN ADMIN =======================
app.get('/api/admins', handle(async (_, res) => {
  const [rows] = await db.query('SELECT id, username, role, namaLengkap, status, createdAt FROM admin_users ORDER BY role DESC, createdAt ASC');
  res.json(rows);
}));

app.post('/api/admins', handle(async (req, res) => {
  const { username, password, role, namaLengkap, status } = req.body;
  await db.query(
    'INSERT INTO admin_users (username, password, role, namaLengkap, status) VALUES (?,?,?,?,?)',
    [username, password, role, namaLengkap, status || 'aktif']
  );
  res.json({ success: true });
}));

app.put('/api/admins/:id', handle(async (req, res) => {
  const { id } = req.params;
  const { username, role, namaLengkap, status, password } = req.body;
  const hasPass = Boolean(password && password.trim());
  const sql = hasPass
    ? 'UPDATE admin_users SET username=?, password=?, role=?, namaLengkap=?, status=? WHERE id=?'
    : 'UPDATE admin_users SET username=?, role=?, namaLengkap=?, status=? WHERE id=?';
  const values = hasPass ? [username, password, role, namaLengkap, status, id] : [username, role, namaLengkap, status, id];
  await db.query(sql, values);
  res.json({ success: true });
}));

app.delete('/api/admins/:id', handle(async (req, res) => {
  await db.query('DELETE FROM admin_users WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

// Global Error Handler Middleware
app.use((err, _req, res, _next) => {
  console.error('[API Error]:', err.message);
  res.status(500).json({
    success: false,
    message: err.code === 'ER_DUP_ENTRY' ? 'Username sudah digunakan' : err.message,
  });
});

app.listen(PORT, () => console.log(`🚀 API Server berjalan di http://localhost:${PORT}`));