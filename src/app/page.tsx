// app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPreview(null);
    setLoading(true);

    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Something went wrong');
      } else {
        setPreview(data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const shortUrl = preview?.short ? `${location.origin}/r/${preview.short}` : null;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Link Preview & Shortener</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste URL (example: https://example.com)"
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Creating…' : 'Create'}
        </button>
      </form>

      {error && <div className="text-red-600 mt-4">{error}</div>}

      {preview && (
        <div className="mt-6 border p-4 rounded shadow-sm">
          <div className="text-sm text-slate-700 break-words">
            Short link:{' '}
            <a href={shortUrl!} className="text-cyan-700 underline">
              {shortUrl}
            </a>
          </div>

          {preview.title && <h2 className="font-semibold mt-3">{preview.title}</h2>}
          {preview.description && <p className="text-sm mt-1">{preview.description}</p>}
          {preview.image && (
            <img src={preview.image} alt="preview" className="mt-3 max-h-48 object-contain" />
          )}
        </div>
      )}
    </main>
  );
}
