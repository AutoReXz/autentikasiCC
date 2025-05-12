# Menggunakan Secret Manager sebagai Alternatif

Selain mengambil file `.env` dari bucket GCS, Anda juga bisa menggunakan Secret Manager untuk menyimpan variabel lingkungan sensitif. Berikut cara mengimplementasikannya:

## 1. Buat Secret di Secret Manager

```powershell
# Membuat secret dari file .env
gcloud secrets create notes-app-env --data-file=.env
```

## 2. Berikan Akses ke Service Account

```powershell
gcloud secrets add-iam-policy-binding notes-app-env \
    --member=serviceAccount:notes-app@YOUR_PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/secretmanager.secretAccessor
```

## 3. Update CloudBuild untuk Menggunakan Secret

Perbarui Cloud Run deployment di `cloudbuild.backend.yaml`:

```yaml
- name: "gcr.io/cloud-builders/gcloud"
  entrypoint: gcloud
  args:
    [
      "run",
      "deploy",
      "notes-app",
      "--image",
      "gcr.io/$PROJECT_ID/notes-app-backend",
      "--timeout",
      "1000s",
      "--port",
      "3000",
      "--region",
      "us-central1",
      "--allow-unauthenticated",
      "--service-account",
      "${_SERVICE_ACCOUNT_EMAIL}",
      "--update-secrets",
      "/usr/src/app/.env=notes-app-env:latest",
    ]
```

Pendekatan ini memiliki beberapa keuntungan dibandingkan dengan mengambil file dari bucket:

1. Lebih aman - Secret Manager dirancang khusus untuk menyimpan informasi sensitif
2. Lebih cepat - Tidak perlu mengunduh file saat startup
3. Versioning - Secret Manager mendukung versioning untuk secrets
4. Audit - Logs akses terhadap secrets

## Implementasi di Aplikasi

Tidak perlu mengubah aplikasi jika menggunakan dotenv, karena Secret Manager akan menyimpan file `.env` langsung di path yang telah ditentukan dalam container.
