'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePaste() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? parseInt(ttl) : undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to the display page
        router.push(`/p/${data.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create paste");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Create a New Paste</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Content</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text here..."
            style={{ 
              width: '100%', 
              height: '300px', 
              padding: '1rem', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Expiry (Seconds)</label>
            <input
              type="number"
              min="1"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              placeholder="e.g. 3600 (1 hour)"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Max Views</label>
            <input
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="e.g. 5"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.8rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Creating...' : 'Create Secret Paste'}
        </button>
      </form>
    </main>
  );
}