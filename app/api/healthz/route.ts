import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export async function GET() {
  try {
    // We use the environment variable directly to prove connectivity
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Fast check [cite: 30]
    await pool.query('SELECT 1');
    await pool.end();

    return NextResponse.json({ ok: true }, { status: 200 }); // [cite: 28, 34]
  } catch (error: any) {
    console.error("Health Check Failed:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message }, 
      { status: 500 }
    );
  }
}