'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function MigratePage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleMigrate = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/prompts/migrate-slugs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Migration failed');
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Migrate Prompt URLs</h1>
      <p className="mb-4">This will update all prompts to use SEO-friendly URLs based on their titles.</p>
      
      <button
        onClick={handleMigrate}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Migrating...' : 'Start Migration'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {results && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="font-bold mb-2">Migration Results:</h2>
          <ul>
            <li>Total prompts: {results.total}</li>
            <li>Updated: {results.updated}</li>
            <li>Skipped: {results.skipped}</li>
            {results.errors.length > 0 && (
              <li>
                Errors:
                <ul className="ml-4">
                  {results.errors.map((err: string, i: number) => (
                    <li key={i} className="text-red-600">{err}</li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
} 