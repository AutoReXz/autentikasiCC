# Fitur Autentikasi Aplikasi Notes

Aplikasi ini dilengkapi dengan sistem autentikasi berbasis JWT dengan fitur-fitur berikut:

## Fitur Backend

1. API Registrasi dan Login Pengguna
2. Autentikasi JWT dengan Access Token dan Refresh Token
3. Hashing Password dengan bcrypt
4. Rute Terproteksi untuk Operasi Notes
5. Notes Spesifik Pengguna (pengguna hanya dapat mengakses catatan miliknya sendiri)
6. Pengelolaan Token yang Aman dengan HTTP-only Cookies
7. Pembaruan Token Otomatis

## Fitur Frontend

1. Form Login dan Registrasi
2. Penyimpanan Token dengan localStorage
3. Permintaan API Terautentikasi
4. Pembaruan Token Otomatis saat Kadaluarsa
5. Tampilan Profil Pengguna
6. Pengelolaan Sesi
7. UI Kondisional berdasarkan Status Autentikasi

## Endpoint API

### Autentikasi
- `POST /api/auth/register` - Mendaftarkan pengguna baru
- `POST /api/auth/login` - Login dan mendapatkan token
- `POST /api/auth/refresh-token` - Memperbaharui access token menggunakan refresh token
- `POST /api/auth/logout` - Logout dan membatalkan token
- `GET /api/auth/me` - Mendapatkan informasi pengguna terautentikasi saat ini

### Notes (Rute Terproteksi)
- `GET /api/notes` - Mendapatkan semua catatan untuk pengguna terautentikasi
- `GET /api/notes/:id` - Mendapatkan catatan tertentu
- `POST /api/notes` - Membuat catatan baru
- `PUT /api/notes/:id` - Memperbarui catatan
- `DELETE /api/notes/:id` - Menghapus catatan
- `GET /api/notes/category/:category` - Mendapatkan catatan berdasarkan kategori

## Alur Autentikasi

1. Pengguna mendaftar atau login
2. Server mengembalikan access token (jangka pendek) dan refresh token (jangka panjang dalam cookie HTTP-only)
3. Access token disimpan dalam localStorage dan digunakan untuk semua permintaan API
4. Ketika access token kedaluwarsa, frontend secara otomatis menggunakan refresh token untuk mendapatkan access token baru
5. Jika refresh gagal, pengguna diarahkan kembali ke halaman login

## Fitur Keamanan

1. Password di-hash dengan bcrypt
2. Token JWT dengan waktu kedaluwarsa yang tepat
3. Cookie HTTP-only untuk refresh token
4. CORS dikonfigurasi untuk komunikasi yang aman
5. Validasi dan penanganan kesalahan
6. Perlindungan terhadap akses yang tidak sah

## Detail Implementasi

### Model Pengguna
- Username, email, password (di-hash), dan penyimpanan refresh token

### Middleware Autentikasi
- Validasi dan verifikasi token
- Melampirkan informasi pengguna ke objek permintaan

### Penanganan Kesalahan API
- Respons kesalahan yang tepat untuk berbagai skenario autentikasi
- Pesan kesalahan yang jelas dan deskriptif

## Keamanan Data Rahasia

Semua data rahasia (seperti JWT secret, kredensial database) disimpan di file `.env` yang tidak disertakan dalam repository. Data yang disimpan dalam file `.env` meliputi:

```
DB_HOST=host_database
DB_USER=user_database
DB_PASSWORD=password_database
DB_NAME=nama_database
JWT_SECRET=kunci_rahasia_jwt
JWT_REFRESH_SECRET=kunci_rahasia_refresh_token
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

## Penggunaan JWT

JWT (JSON Web Token) digunakan untuk mengamankan komunikasi antara frontend dan backend. Implementasi JWT melibatkan:

1. Access token: Token jangka pendek (1 jam) untuk mengakses API terproteksi
2. Refresh token: Token jangka panjang (7 hari) untuk mendapatkan access token baru
3. Verifikasi token di setiap permintaan API terproteksi
4. Penggunaan middleware untuk memvalidasi token
