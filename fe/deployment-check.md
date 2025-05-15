# Panduan Deployment Notes App

## Checklist Sebelum Deployment

Berikut adalah checklist yang perlu diverifikasi sebelum melakukan deployment aplikasi Notes:

### 1. Konfigurasi API URL

- [x] `config.js` memiliki URL backend yang benar
- [x] URL tidak memiliki trailing slash di akhir
- [x] Format URL konsisten di semua file

### 2. Format Endpoint

- [x] Semua endpoint auth menggunakan format `/api/auth/...`
- [x] Semua endpoint notes menggunakan format `/api/notes/...`
- [x] Proxy di `server.js` dikonfigurasi untuk route `/auth` diarahkan ke `/api/auth`

### 3. Autentikasi

- [x] Token disimpan dengan benar di localStorage
- [x] Cookies `withCredentials` diaktifkan untuk refresh token
- [x] Handler error 401 (Unauthorized) dikonfigurasi dengan benar

### 4. CORS dan Headers

- [x] CORS headers dikonfigurasi dengan benar
- [x] Authorization header ditambahkan ke semua permintaan

## Cara Menjalankan Test Deployment

1. Pastikan backend sudah berjalan
2. Install dependencies: `npm install axios --save-dev`
3. Jalankan skrip test: `node deployment-test.js`
4. Verifikasi hasil dan pastikan tidak ada error

## Checklist Cloud Build

- [ ] Environment variables di Cloud Build sudah diatur dengan benar
- [ ] `BACKEND_URL` mengarah ke backend yang benar
- [ ] Service account memiliki izin yang diperlukan
- [ ] Port di container sudah dipetakan dengan benar (8080)

## Langkah-langkah Deployment

1. Persiapan repository
   ```bash
   git add .
   git commit -m "Fix API endpoints format for deployment"
   git push origin main
   ```

2. Deploy backend terlebih dahulu
   ```bash
   gcloud builds submit --config=cloudbuild.backend.yaml .
   ```

3. Verifikasi backend sudah berjalan
   ```bash
   curl https://<backend-url>/api/health
   ```

4. Deploy frontend
   ```bash
   gcloud builds submit --config=cloudbuild.frontend.yaml .
   ```

5. Verifikasi aplikasi berjalan dengan baik di URL frontend
