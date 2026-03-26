import mysql from 'mysql2/promise';
import { logger } from '../utils/logger.js';

const pool = mysql.createPool({
  host:            process.env.DB_HOST,
  port:            process.env.DB_PORT || 3306,
  user:            process.env.DB_USER,
  password:        process.env.DB_PASSWORD,
  database:        process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit:      0,
  timezone:        'Z',
});

// Verify connection on startup
export async function connectDB() {
  const conn = await pool.getConnection();
  logger.info('✅ MySQL connected successfully');
  conn.release();
}

export default pool;
