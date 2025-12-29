import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
    try {
        const { content, ttl_seconds, max_views } = await req.json();

        const id = nanoid(10);

        // Date.now() is the number of milliseconds since the UTC epoch.
        // So 'nowUtc' and 'expiresAt' will be true UTC timestamps.
        const nowUtc = new Date();
        let expiresAt = null;

        if (ttl_seconds) {
            expiresAt = new Date(nowUtc.getTime() + ttl_seconds * 1000);
        }

        const query = `
      INSERT INTO "Paste" (id, content, created_at, expires_at, max_views, remaining_views)
      VALUES ($1, $2, $3, $4, $5, $6)`;

        // We explicitly pass nowUtc to ensure 'created_at' isn't left to database defaults
        await pool.query(query, [
            id,
            content,
            nowUtc,
            expiresAt,
            max_views || null,
            max_views || null
        ]);


        // 4. URL Generation
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';

        return NextResponse.json({
            id,
            url: `${protocol}://${host}/p/${id}`
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create" }, { status: 400 });
    }
}