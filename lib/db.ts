import { Pool } from 'pg';

// Create a connection pool
let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const config = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
    console.log('Creating pool with config:', {
      ...config,
      password: config.password ? '***' : undefined
    });
    pool = new Pool(config);
  }
  return pool;
}

// Type definitions for our database
export interface Review {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  rating: number;
  review_text: string;
  service_type: string;
  status: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
  approval_token?: string;
  token_expires_at?: string;
  created_at: string;
  approved_at?: string;
  updated_at: string;
}

// Initialize database schema
export async function initDatabase() {
  const pool = getPool();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255),
      email VARCHAR(255),
      company VARCHAR(255),
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_text TEXT NOT NULL,
      service_type VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      featured BOOLEAN DEFAULT FALSE,
      approval_token VARCHAR(255),
      token_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
    CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_reviews_approval_token ON reviews(approval_token);
  `;

  try {
    await pool.query(createTableQuery);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
