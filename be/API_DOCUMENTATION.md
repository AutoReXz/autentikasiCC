# Notes API Documentation

Dokumentasi ini memberikan informasi tentang API backend untuk aplikasi Notes, cara menggunakan endpoint, dan contoh request/response.

## Informasi Umum

- **Base URL**: `http://localhost:3000` (development) atau URL server hosting
- **Format Data**: JSON
- **Autentikasi**: JWT (JSON Web Token)

## Autentikasi

Semua operasi notes membutuhkan autentikasi. Untuk mengakses endpoint yang dilindungi, anda harus menyediakan token access yang valid di header Authorization.

**Format Header Authentication**:
```
Authorization: Bearer <your_access_token>
```

### Endpoint Autentikasi

#### Registrasi User Baru

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response Sukses**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGc..."
}
```

#### Login User

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "username": "user123",
  "password": "password123"
}
```
- **Catatan**: Kolom `username` juga bisa diisi dengan email
- **Response Sukses**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGc..."
}
```

#### Refresh Token

- **URL**: `/api/auth/refresh-token`
- **Method**: `POST`
- **Autentikasi**: Menggunakan refresh token yang dikirim sebagai HTTP-only cookie
- **Response Sukses**:
```json
{
  "accessToken": "eyJhbGc..."
}
```

#### Logout User

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Autentikasi**: Menggunakan refresh token yang dikirim sebagai HTTP-only cookie
- **Response Sukses**:
```json
{
  "message": "Logged out successfully"
}
```

#### Mendapatkan Data User Saat Ini

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Autentikasi**: Bearer token
- **Response Sukses**:
```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com"
}
```

## Endpoint Notes

### Mendapatkan Semua Notes

- **URL**: `/api/notes`
- **Method**: `GET`
- **Autentikasi**: Bearer token
- **Response Sukses**:
```json
[
  {
    "id": 1,
    "title": "Catatan Pertama",
    "content": "Ini adalah isi dari catatan pertama",
    "category": "work",
    "userId": 1,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Catatan Kedua",
    "content": "Ini adalah isi dari catatan kedua",
    "category": "personal",
    "userId": 1,
    "createdAt": "2023-01-02T12:00:00.000Z",
    "updatedAt": "2023-01-02T12:00:00.000Z"
  }
]
```

### Mendapatkan Note Berdasarkan ID

- **URL**: `/api/notes/:id`
- **Method**: `GET`
- **Autentikasi**: Bearer token
- **Response Sukses**:
```json
{
  "id": 1,
  "title": "Catatan Pertama",
  "content": "Ini adalah isi dari catatan pertama",
  "category": "work",
  "userId": 1,
  "createdAt": "2023-01-01T12:00:00.000Z",
  "updatedAt": "2023-01-01T12:00:00.000Z"
}
```

### Mendapatkan Notes Berdasarkan Kategori

- **URL**: `/api/notes/category/:category`
- **Method**: `GET`
- **Autentikasi**: Bearer token
- **Category Options**: `work`, `personal`, `study`
- **Response Sukses**:
```json
[
  {
    "id": 1,
    "title": "Catatan Pertama",
    "content": "Ini adalah isi dari catatan pertama",
    "category": "work",
    "userId": 1,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
]
```

### Membuat Note Baru

- **URL**: `/api/notes`
- **Method**: `POST`
- **Autentikasi**: Bearer token
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "title": "Catatan Baru",
  "content": "Ini adalah isi dari catatan baru",
  "category": "work"
}
```
- **Catatan**: `category` adalah opsional dan defaultnya adalah `work`. Nilai yang diperbolehkan: `work`, `personal`, `study`
- **Response Sukses**:
```json
{
  "id": 3,
  "title": "Catatan Baru",
  "content": "Ini adalah isi dari catatan baru",
  "category": "work",
  "userId": 1,
  "createdAt": "2023-01-03T12:00:00.000Z",
  "updatedAt": "2023-01-03T12:00:00.000Z"
}
```

### Mengubah Note

- **URL**: `/api/notes/:id`
- **Method**: `PUT`
- **Autentikasi**: Bearer token
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "title": "Catatan Diubah",
  "content": "Ini adalah isi catatan yang telah diubah",
  "category": "personal"
}
```
- **Response Sukses**:
```json
{
  "id": 1,
  "title": "Catatan Diubah",
  "content": "Ini adalah isi catatan yang telah diubah",
  "category": "personal",
  "userId": 1,
  "createdAt": "2023-01-01T12:00:00.000Z",
  "updatedAt": "2023-01-03T14:00:00.000Z"
}
```

### Menghapus Note

- **URL**: `/api/notes/:id`
- **Method**: `DELETE`
- **Autentikasi**: Bearer token
- **Response Sukses**:
```json
{
  "message": "Note deleted successfully"
}
```

## Kode Status HTTP

- `200 OK`: Request berhasil
- `201 Created`: Resource berhasil dibuat
- `400 Bad Request`: Request tidak valid
- `401 Unauthorized`: Autentikasi gagal atau tidak ada
- `404 Not Found`: Resource tidak ditemukan
- `409 Conflict`: Konflik dengan resource yang sudah ada (misalnya username atau email sudah terdaftar)
- `500 Internal Server Error`: Terjadi kesalahan di server

## Implementasi di Frontend

### Contoh Penggunaan dengan Fetch API

```javascript
// Contoh login
async function login(username, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // penting untuk menyimpan cookie refresh token
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  // Simpan token di localStorage atau state management
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  
  return data;
}

// Contoh mendapatkan semua notes
async function fetchNotes() {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/notes', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  
  return await response.json();
}

// Contoh refresh token ketika access token expired
async function refreshAccessToken() {
  const response = await fetch('http://localhost:3000/api/auth/refresh-token', {
    method: 'POST',
    credentials: 'include', // penting untuk mengirim cookie refresh token
  });
  
  const data = await response.json();
  
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  
  return data;
}
```

### Catatan Penting

1. Pastikan mengatur `credentials: 'include'` pada request fetch untuk mengirim dan menerima cookies (penting untuk refresh token).
2. Simpan access token di localStorage atau state management di frontend.
3. Implementasi mekanisme untuk meng-handle expired token, misalnya dengan melakukan refresh token secara otomatis ketika mendapat response 401.
4. Pastikan CORS di backend sudah dikonfigurasi dengan benar untuk mengizinkan request dari frontend.
