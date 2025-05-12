# Panduan Cepat Mengatasi Error Service Account Cloud Run

## Error yang Terjadi
```
PERMISSION_DENIED: Permission 'iam.serviceaccounts.actAs' denied on service account notes-app@f-13-450706.iam.gserviceaccount.com
```

## Solusi Cepat

### Opsi 1: Jalankan Deployment Tanpa Service Account Khusus
Opsi ini adalah cara termudah jika Anda tidak membutuhkan service account khusus:

```powershell
# Jalankan deploy dengan parameter USE_SERVICE_ACCOUNT=false
gcloud builds submit --config=cloudbuild.backend.yaml --substitutions=_USE_SERVICE_ACCOUNT=false
```

Dengan opsi ini, Cloud Run akan menggunakan service account default yang sudah memiliki izin untuk deployment.

### Opsi 2: Buat Service Account Baru dan Berikan Izin
Jika Anda membutuhkan service account khusus:

1. **Buat service account**:
```powershell
gcloud iam service-accounts create notes-app --display-name="Notes App Service Account" --project=f-13-450706
```

2. **Berikan izin pada Cloud Build untuk menggunakan service account**:
```powershell
$PROJECT_ID="f-13-450706"
$PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud iam service-accounts add-iam-policy-binding notes-app@$PROJECT_ID.iam.gserviceaccount.com --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" --role="roles/iam.serviceAccountUser"
```

3. **Jalankan deploy dengan service account baru**:
```powershell
gcloud builds submit --config=cloudbuild.backend.yaml --substitutions=_USE_SERVICE_ACCOUNT=true
```

### Opsi 3: Untuk Deployment Saat Ini (Tanpa Mengubah File)
Jika tidak ingin mengubah file konfigurasi:

```powershell
# Opsi langsung tanpa service account
gcloud run deploy notes-app --image=gcr.io/f-13-450706/notes-app-backend --timeout=1000s --port=3000 --region=us-central1 --allow-unauthenticated --set-env-vars=ENV_BUCKET_NAME=my-env-bucket,ENV_FILE_PATH=config/.env
```

## Informasi Lebih Lanjut
Untuk panduan lengkap dan detail tentang mengatasi masalah service account, lihat file `FIX_SERVICE_ACCOUNT.md` di folder `be`.
