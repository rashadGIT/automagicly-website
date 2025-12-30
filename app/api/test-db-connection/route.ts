import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    const config = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

    console.log('Testing connection with config:', {
      ...config,
      password: config.password ? '***' : undefined
    });

    const pool = new Pool(config);
    const result = await pool.query('SELECT version()');
    await pool.end();

    return NextResponse.json({
      success: true,
      version: result.rows[0].version,
      config: {
        ...config,
        password: '***'
      }
    });
  } catch (error: any) {
    console.error('Connection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      envVars: {
        DB_HOST: process.env.DB_HOST || 'undefined',
        DB_PORT: process.env.DB_PORT || 'undefined',
        DB_NAME: process.env.DB_NAME || 'undefined',
        DB_USER: process.env.DB_USER || 'undefined',
        DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'undefined',
        DB_SSL: process.env.DB_SSL || 'undefined',
      }
    }, { status: 500 });
  }
}
