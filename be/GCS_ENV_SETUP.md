# Mengambil Environment Variables dari Google Cloud Storage

Dokumen ini menjelaskan cara mengambil file `.env` dari Google Cloud Storage untuk aplikasi Cloud Run.

## Prasyarat

1. Bucket Google Cloud Storage sudah dibuat
2. Service account yang digunakan oleh Cloud Run sudah memiliki akses ke bucket
3. File `.env` sudah diunggah ke bucket

## Cara Kerja

Aplikasi ini dikonfigurasi untuk secara otomatis mengambil file `.env` dari bucket GCS saat container dijalankan, menggunakan script `fetch-env.sh`. Ini memungkinkan Anda untuk mengelola konfigurasi lingkungan tanpa perlu membangun ulang container.

## Langkah-langkah Setup

### 1. Buat Bucket GCS

```powershell
gcloud storage buckets create gs://my-env-bucket --location=us-central1
```

### 2. Unggah file `.env` ke Bucket

```powershell
gcloud storage cp .env gs://my-env-bucket/config/.env
```

### 3. Berikan Akses ke Service Account

```powershell
gcloud storage buckets add-iam-policy-binding gs://my-env-bucket --member=serviceAccount:notes-app@YOUR_PROJECT_ID.iam.gserviceaccount.com --role=roles/storage.objectViewer
```

### 4. Deploy dengan Cloud Build

Jalankan build dengan parameter bucket dan path yang sesuai:

```powershell
gcloud builds submit --config=cloudbuild.backend.yaml --substitutions=_ENV_BUCKET_NAME="my-env-bucket",_ENV_FILE_PATH="config/.env"
```

## Konfigurasi Environment Variables

File `.env` dapat berisi semua konfigurasi yang dibutuhkan aplikasi, seperti:

```
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-jwt-secret
```

## Troubleshooting

Jika terjadi masalah dengan pengambilan file `.env`:

1. Periksa log Cloud Run untuk melihat pesan error
2. Pastikan service account memiliki akses yang benar ke bucket
3. Verifikasi bahwa file `.env` berada di path yang benar di bucket

## Alternative: Secret Manager

Sebagai alternatif dari menggunakan bucket GCS, Anda juga bisa menggunakan Secret Manager untuk menyimpan variabel lingkungan secara lebih aman. Untuk detailnya, lihat dokumen `use-secret-manager.md`.
