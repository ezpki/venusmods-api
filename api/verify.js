export default async function handler(req, res) {
  // Buka gerbang CORS agar Steam bisa mengakses API ini
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { apiKey, deviceId } = req.body;

  // Simulasi Database (Nantinya diganti dengan PostgreSQL)
  let license = {
    key: "VN-X789-P2M1",
    registered_device: null 
  };

  if (!license || license.key !== apiKey) {
    return res.status(401).json({ valid: false, message: "Kunci tidak terdaftar." });
  }

  if (license.registered_device === null) {
    return res.status(200).json({ valid: true, message: "Kunci berhasil diaktifkan untuk komputer ini!" });
  }

  if (license.registered_device !== deviceId) {
    return res.status(401).json({ valid: false, message: "Akses Ditolak! Kunci ini sudah digunakan di komputer lain." });
  }

  return res.status(200).json({ valid: true, message: "Akses Premium Diizinkan" });
}
