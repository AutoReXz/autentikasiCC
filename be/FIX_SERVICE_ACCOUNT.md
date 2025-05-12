## Langkah-langkah untuk Memperbaiki Masalah Service Account

### 1. Periksa apakah service account sudah ada
```powershell
gcloud iam service-accounts list --project=f-13-450706
```

### 2. Jika service account belum ada, buat service account baru
```powershell
gcloud iam service-accounts create notes-app --display-name="Notes App Service Account" --project=f-13-450706
```

### 3. Berikan izin pada Cloud Build Service Account untuk dapat menggunakan service account tersebut
```powershell
# Ambil nomor project
$PROJECT_ID="f-13-450706"
$PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Berikan izin pada Cloud Build Service Account
gcloud iam service-accounts add-iam-policy-binding notes-app@$PROJECT_ID.iam.gserviceaccount.com `
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" `
  --role="roles/iam.serviceAccountUser"
```

### 4. Berikan izin yang dibutuhkan pada service account untuk mengakses GCS
```powershell
# Misalnya jika Anda memerlukan akses ke bucket
gcloud storage buckets add-iam-policy-binding gs://my-env-bucket `
  --member="serviceAccount:notes-app@$PROJECT_ID.iam.gserviceaccount.com" `
  --role="roles/storage.objectViewer"
```

### 5. Jalankan ulang deployment
```powershell
gcloud builds submit --config=cloudbuild.backend.yaml
```
