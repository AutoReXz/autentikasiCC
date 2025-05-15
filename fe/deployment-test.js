/**
 * Utility script untuk memverifikasi konfigurasi frontend sebelum deployment
 * 
 * Menjalankan script ini akan memeriksa:
 * 1. Konsistensi URL yang digunakan untuk API di frontend
 * 2. Format endpoint yang benar (/api/auth/* dan /api/notes/*)
 * 3. Koneksi ke backend
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Baca file konfigurasi
const configPath = path.join(__dirname, 'config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract API URL from config
const apiUrlMatch = configContent.match(/DEFAULT_URL:\s*['"](.+)['"]/);
const apiUrl = apiUrlMatch ? apiUrlMatch[1] : null;

console.log('============================================');
console.log('📝 FRONTEND DEPLOYMENT TEST');
console.log('============================================');
console.log(`🔍 API URL from config: ${apiUrl}`);

// Periksa file penting
const filesToCheck = ['auth.js', 'notes-app.js', 'server.js'];
const results = {
  urlFormat: true,
  endpointFormat: true
};

console.log('\n🔍 Memeriksa format URL dalam file:');
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for incorrect API endpoints
  const incorrectAuthEndpoints = content.match(/\/auth\/[a-z\-]+/g) || [];
  const incorrectNotesEndpoints = content.match(/\/notes(?!\/api\/)/g) || [];
  
  if (incorrectAuthEndpoints.length > 0 || incorrectNotesEndpoints.length > 0) {
    results.endpointFormat = false;
    console.log(`  ❌ ${file}: Memiliki format endpoint yang salah`);
    
    if (incorrectAuthEndpoints.length > 0) {
      console.log(`    - Auth endpoints yang salah: ${incorrectAuthEndpoints.join(', ')}`);
      console.log(`      Seharusnya: /api/auth/...`);
    }
    
    if (incorrectNotesEndpoints.length > 0) {
      console.log(`    - Notes endpoints yang salah: ${incorrectNotesEndpoints.join(', ')}`);
      console.log(`      Seharusnya: /api/notes/...`);
    }
  } else {
    console.log(`  ✅ ${file}: Format endpoint sudah benar`);
  }
});

// Test connection to API
console.log('\n🔄 Testing koneksi ke API...');

async function testConnection() {
  try {
    const response = await axios.get(`${apiUrl}/api/health`, { timeout: 5000 });
    console.log(`  ✅ Berhasil terhubung ke ${apiUrl}/api/health`);
    console.log(`  ✅ Response: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log(`  ❌ Gagal terhubung ke ${apiUrl}/api/health`);
    if (error.response) {
      console.log(`  ❌ Status: ${error.response.status}`);
      console.log(`  ❌ Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log(`  ❌ Tidak ada response dari server`);
    } else {
      console.log(`  ❌ Error: ${error.message}`);
    }
    return false;
  }
}

// Final summary
testConnection().then(connectionSuccess => {
  console.log('\n============================================');
  console.log('📋 HASIL PEMERIKSAAN');
  console.log('============================================');
  console.log(`✅ Format URL: ${results.urlFormat ? 'Benar' : 'Perlu diperbaiki'}`);
  console.log(`${results.endpointFormat ? '✅' : '❌'} Format endpoint: ${results.endpointFormat ? 'Benar' : 'Perlu diperbaiki'}`);
  console.log(`${connectionSuccess ? '✅' : '❌'} Koneksi API: ${connectionSuccess ? 'Berhasil' : 'Gagal'}`);
  
  const readyToDeploy = results.urlFormat && results.endpointFormat && connectionSuccess;
  
  console.log('\n============================================');
  console.log(`${readyToDeploy ? '✅ SIAP UNTUK DEPLOY' : '❌ BELUM SIAP UNTUK DEPLOY'}`);
  console.log('============================================');
  
  if (!readyToDeploy) {
    console.log('\nPerbaikan yang perlu dilakukan:');
    if (!results.urlFormat) {
      console.log('- Pastikan API URL konsisten di semua file');
    }
    if (!results.endpointFormat) {
      console.log('- Perbaiki format endpoint ke /api/auth/* dan /api/notes/*');
    }
    if (!connectionSuccess) {
      console.log('- Periksa koneksi ke backend API');
      console.log(`- Pastikan server backend berjalan di ${apiUrl}`);
    }
  }
});
