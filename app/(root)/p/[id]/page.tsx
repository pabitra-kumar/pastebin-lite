import { pool } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ViewPastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Fix: Await the params in Next.js 15
  const { id } = await params;

  try {
    const result = await pool.query('SELECT * FROM "Paste" WHERE id = $1', [
      id,
    ]);
    const paste = result.rows[0];

    if (!paste) notFound();

    const now = new Date();
    const isExpired = paste.expires_at && now > new Date(paste.expires_at);
    const isOutOfViews = paste.max_views !== null && paste.remaining_views <= 0;

    if (isExpired || isOutOfViews) notFound();

    await pool.query(
      'UPDATE "Paste" SET remaining_views = remaining_views - 1 WHERE id = $1',
      [id]
    );

    return (
      <main style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
        <pre
          style={{
            padding: "1rem",
            background: "#eee",
            color: "#000",
            whiteSpace: "pre-wrap",
          }}
        >
          {paste.content}
        </pre>
      </main>
    );
  } catch (error) {
    notFound();
  }
}
