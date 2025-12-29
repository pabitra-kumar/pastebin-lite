import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Fix: Await the params before accessing properties
  const { id } = await params;
  
  // 1. Deterministic Time Logic
  const isTestMode = process.env.TEST_MODE === '1';
  const testNowMs = req.headers.get('x-test-now-ms');
  const now = (isTestMode && testNowMs) ? new Date(parseInt(testNowMs)) : new Date();

  try {
    const result = await pool.query('SELECT * FROM "Paste" WHERE id = $1', [id]);
    const paste = result.rows[0];

    if (!paste) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    // 2. Expiry and View Logic
    const isExpired = paste.expires_at && now > new Date(paste.expires_at);
    const isOutOfViews = paste.max_views !== null && paste.remaining_views <= 0;

    if (isExpired || isOutOfViews) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // 3. Decrement Views
    await pool.query(
      'UPDATE "Paste" SET remaining_views = remaining_views - 1 WHERE id = $1',
      [id]
    );

    return NextResponse.json({
      content: paste.content,
      remaining_views: paste.max_views ? paste.remaining_views - 1 : null,
      expires_at: paste.expires_at
    });

  } catch (error) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
}