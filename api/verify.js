import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Buka gerbang CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { apiKey, deviceId } = req.body;

  // Cek apakah ekstensi mengirim data yang lengkap
  if (!apiKey || !deviceId) {
    return res.status(400).json({ valid: false, message: "Data tidak lengkap." });
  }

  try {
    // 1. Cari Kunci API di dalam tabel PostgreSQL
    const { rows } = await sql`SELECT * FROM licenses WHERE key = ${apiKey}`;

    // Jika kuncinya tidak ada di database
    if (rows.length === 0) {
      return res.status(401).json({ valid: false, message: "Kunci lisensi tidak terdaftar." });
    }

    const license = rows[0];

    // Jika kunci diblokir secara manual olehmu
    if (license.status !== 'active') {
      return res.status(401).json({ valid: false, message: "Lisensi ini sudah diblokir atau kadaluarsa." });
    }

    // 2. Jika Kunci BELUM terikat (Penggunaan Pertama Kali)
    if (!license.registered_device) {
      // Kunci ID Perangkat pengguna ke database selamanya!
      await sql`UPDATE licenses SET registered_device = ${deviceId} WHERE key = ${apiKey}`;
      return res.status(200).json({ valid: true, message: "Kunci berhasil diaktifkan untuk komputer ini!" });
    }

    // 3. Jika Kunci SUDAH terikat, pastikan ID Perangkatnya cocok
    if (license.registered_device !== deviceId) {
      return res.status(401).json({ valid: false, message: "Akses Ditolak! Kunci ini sudah terikat dan digunakan di komputer lain." });
    }

    // 4. Lolos semua hadangan, izinkan akses!
    return res.status(200).json({ valid: true, message: "Akses Premium Diizinkan" });

  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ valid: false, message: "Terjadi kesalahan pada server VenusMods." });
  }
}
