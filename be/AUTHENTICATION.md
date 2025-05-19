# Ringkasan Implementasi Autentikasi

## Fitur yang Ditambahkan
1. Registrasi dan login pengguna dengan autentikasi JWT
2. Implementasi access token dan refresh token
3. Rute aman menggunakan middleware
4. Notes khusus pengguna (pengguna hanya dapat melihat catatan mereka sendiri)

## File yang Dibuat/Dimodifikasi

### File Baru
- `models/user.js`: Model pengguna dengan hashing password
- `controllers/authController.js`: Logika autentikasi (register, login, refresh token, logout)
- `middleware/authMiddleware.js`: Middleware validasi JWT
- `routes/authRoutes.js`: Endpoint API autentikasi
- `utils/generate-jwt-secret.js`: Utilitas untuk menghasilkan JWT secret yang aman

### File yang Dimodifikasi
- `models/index.js`: Menambahkan model User dan asosiasi
- `models/note.js`: Menambahkan field userId untuk asosiasi dengan pengguna
- `controllers/noteController.js`: Menambahkan filter pengguna ke semua operasi note
- `routes/noteRoutes.js`: Rute yang dilindungi dengan middleware autentikasi
- `app.js`: Menambahkan rute auth dan cookie parser
- `package.json`: Menambahkan dependensi dan script baru
- `README.md`: Diperbarui dengan dokumentasi autentikasi
- `.env`: Menambahkan JWT secrets

## Endpoint API

### Autentikasi
- `POST /api/auth/register`: Membuat akun pengguna baru
- `POST /api/auth/login`: Mengautentikasi pengguna dan menerima token
- `POST /api/auth/refresh-token`: Mendapatkan access token baru menggunakan refresh token
- `POST /api/auth/logout`: Membatalkan refresh token
- `GET /api/auth/me`: Mendapatkan informasi pengguna terautentikasi saat ini

### Notes (Semua sekarang memerlukan autentikasi)
- `GET /api/notes`: Mendapatkan semua catatan untuk pengguna terautentikasi
- `POST /api/notes`: Membuat catatan baru
- `GET /api/notes/:id`: Mendapatkan catatan tertentu
- `PUT /api/notes/:id`: Memperbarui catatan
- `DELETE /api/notes/:id`: Menghapus catatan
- `GET /api/notes/category/:category`: Mendapatkan catatan berdasarkan kategori

## Cara Kerja

1. **Registrasi**: Akun pengguna dibuat dengan password yang di-hash
2. **Login**: Pengguna memberikan kredensial dan menerima:
   - Access token (jangka pendek, 15 menit)
   - Refresh token (jangka panjang, 7 hari) disimpan dalam cookie HTTP-only
3. **Akses API**:
   - Klien menyertakan access token di header Authorization
   - Server memvalidasi token sebelum memproses permintaan
4. **Pembaruan Token**:
   - Ketika access token kedaluwarsa, klien menggunakan refresh token untuk mendapatkan yang baru
   - Refresh token disimpan dalam database dan dibatalkan saat logout
5. **Langkah-langkah Keamanan**:
   - Password di-hash dengan bcrypt
   - Token ditandatangani dengan secret yang aman
   - Cookie HTTP-only untuk refresh token
   - Rute terproteksi memerlukan autentikasi yang valid
   - Isolasi data pengguna (pengguna hanya dapat mengakses catatan mereka sendiri)

## Variabel Lingkungan

Variabel lingkungan yang diperlukan untuk autentikasi disimpan dalam file `.env`:

```
JWT_SECRET=kunci_rahasia_jwt_anda
JWT_REFRESH_SECRET=kunci_rahasia_refresh_token_anda
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Pastikan untuk tidak menyertakan file `.env` dalam repositori kode.
