# Aplikasi Notes

Aplikasi Notes dengan arsitektur microservices yang di-deploy ke Google Cloud Platform. Aplikasi ini merupakan implementasi dari tugas mata kuliah Teknologi Cloud Computing.

## Fitur Aplikasi

- **CRUD Notes**: Membuat, membaca, memperbarui, dan menghapus catatan
- **Kategorisasi Notes**: Mengelompokkan catatan berdasarkan kategori
- **Autentikasi**: Sistem autentikasi lengkap menggunakan JWT (login, register, logout)
- **User-specific Notes**: Pengguna hanya dapat mengakses catatan miliknya sendiri

## Struktur Proyek

```
.
├── be/                           # Layanan Backend (Node.js)
│   ├── config/                   # Konfigurasi database dan environment
│   │   └── database.js           # Konfigurasi koneksi database
│   ├── controllers/              # Logic aplikasi
│   │   ├── authController.js     # Kontroler untuk autentikasi
│   │   └── noteController.js     # Kontroler untuk manajemen catatan
│   ├── middleware/               # Middleware aplikasi
│   │   └── authMiddleware.js     # Middleware untuk autentikasi
│   ├── models/                   # Model database
│   │   ├── index.js              # Konfigurasi model
│   │   ├── note.js               # Model catatan
│   │   └── user.js               # Model pengguna
│   ├── routes/                   # Rute API
│   │   ├── authRoutes.js         # Rute autentikasi
│   │   └── noteRoutes.js         # Rute manajemen catatan
│   ├── utils/                    # Fungsi utilitas
│   │   ├── database-check.js     # Pengecekan koneksi database
│   │   ├── generate-jwt-secret.js # Pembuatan secret JWT
│   │   ├── initialize-db.js      # Inisialisasi database
│   │   ├── migrate-categories.js # Migrasi kategori
│   │   ├── mysql-error-handler.js # Penanganan error MySQL
│   │   └── reset-database.js     # Reset database
│   ├── API_DOCUMENTATION.md      # Dokumentasi API
│   ├── app.js                    # Aplikasi Express
│   ├── AUTHENTICATION.md         # Dokumentasi autentikasi
│   ├── check-users.js            # Skrip pengecekan pengguna
│   ├── Dockerfile                # Konfigurasi Docker untuk backend
│   ├── MYSQL_SETUP.md            # Panduan setup database MySQL
│   ├── package.json              # Dependensi backend
│   ├── README.md                 # Dokumentasi backend
│   └── server.js                 # Entry point server
├── fe/                           # Layanan Frontend
│   ├── auth-script.js            # Skrip autentikasi
│   ├── auth.js                   # Fungsi autentikasi
│   ├── app.yaml                  # Konfigurasi App Engine
│   ├── config.js                 # Konfigurasi frontend
│   ├── deployment-check.md       # Panduan pengecekan deployment
│   ├── deployment-test.js        # Skrip pengujian deployment
│   ├── Dockerfile                # Konfigurasi Docker untuk frontend
│   ├── index.html                # Halaman utama
│   ├── notes-app.js              # Aplikasi notes
│   ├── package.json              # Dependensi frontend
│   ├── README.md                 # Dokumentasi frontend
│   └── server.js                 # Server frontend
├── AUTHENTICATION.md             # Dokumentasi autentikasi umum
├── cloudbuild.backend.yaml       # Konfigurasi CI/CD untuk backend
├── cloudbuild.frontend.yaml      # Konfigurasi CI/CD untuk frontend
├── package.json                  # Dependensi proyek utama
└── README.md                     # Dokumentasi utama
```

## Teknologi yang Digunakan

- **Backend**: Node.js dengan Express
- **Frontend**: HTML, JavaScript
- **Database**: MySQL
- **Autentikasi**: JWT (JSON Web Token)
- **Keamanan**: bcrypt untuk hashing password
- **Deployment**: Google Cloud Platform (Cloud Run & App Engine)
- **CI/CD**: Cloud Build

## Deployment

### Backend (Cloud Run)

Backend di-deploy ke Cloud Run dengan konfigurasi di `cloudbuild.backend.yaml`:

1. Build Docker image
2. Push ke Container Registry
3. Deploy ke Cloud Run

### Frontend (App Engine)

Frontend di-deploy langsung ke App Engine menggunakan `cloudbuild.frontend.yaml`.

## Setup Lokal

### Backend

```bash
cd be
npm install
# Buat file .env dengan konfigurasi yang diperlukan
# Contoh isi .env:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=password
# DB_NAME=notes_db
# JWT_SECRET=rahasia_jwt_anda
# JWT_REFRESH_SECRET=rahasia_refresh_token_anda
# JWT_EXPIRES_IN=1h
# JWT_REFRESH_EXPIRES_IN=7d
npm start
```

### Frontend

```bash
cd fe
npm install
# Sesuaikan config.js dengan URL backend Anda
npm start
```

## Fitur Autentikasi

Aplikasi ini menggunakan autentikasi berbasis JWT (JSON Web Token) dengan fitur:

1. Register dan login pengguna
2. Token akses dan token refresh
3. Perlindungan rute untuk operasi notes
4. Penyimpanan password yang aman dengan bcrypt
5. Pengelolaan token yang aman

Untuk detail lebih lanjut tentang implementasi autentikasi, lihat file `AUTHENTICATION.md`.

## CI/CD Pipeline

Proyek ini menggunakan Google Cloud Build untuk continuous integration dan deployment:

- Perubahan pada backend akan memicu build dan deploy ke Cloud Run
- Perubahan pada frontend akan memicu deploy ke App Engine

## Database

Backend terhubung ke database MySQL. Lihat `be/MYSQL_SETUP.md` untuk detail konfigurasi database.
