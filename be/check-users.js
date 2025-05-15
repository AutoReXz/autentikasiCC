import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkUsers() {
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');
    
    // Query users table
    const [rows] = await connection.execute('SELECT * FROM Users');
    
    console.log('Found users:', rows.length);
    console.log(JSON.stringify(rows, null, 2));
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
