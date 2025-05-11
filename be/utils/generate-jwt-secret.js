// utils/generate-jwt-secret.js
import crypto from 'crypto';

// Generate a random hex string for JWT secrets
const generateSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

console.log('Generated JWT Secrets:');
console.log('ACCESS_TOKEN_SECRET=' + generateSecret());
console.log('REFRESH_TOKEN_SECRET=' + generateSecret());
console.log('\nAdd these to your .env file if not already present.');
