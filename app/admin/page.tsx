'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const AdminPanel = dynamic(() => import('../../components/AdminPanel'), { ssr: false });

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed]     = useState(false);
  const [error, setError]       = useState('');
  const [checking, setChecking] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    try {
      const res = await fetch('/api/admin?resource=guestbook', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Server error');
    } finally {
      setChecking(false);
    }
  };

  if (authed) {
    return (
      <AdminPanel
        adminPassword={password}
        onLogout={() => { setAuthed(false); setPassword(''); }}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060401',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      <form onSubmit={handleLogin} style={{ width: 320 }}>
        <div style={{ color: '#ffcc60', fontSize: '16px', marginBottom: '1.5rem' }}>
          ARORA.SYS — Admin Access
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%',
              background: '#0a0700',
              border: '1px solid #7a5010',
              color: '#e8a020',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '13px',
              padding: '0.5rem',
              outline: 'none',
            }}
          />
        </div>
        {error && (
          <div style={{ color: '#cc4400', marginBottom: '0.75rem', fontSize: '12px' }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={checking}
          style={{
            background: 'transparent',
            border: '1px solid #e8a020',
            color: '#e8a020',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '13px',
            padding: '0.4rem 1.5rem',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {checking ? 'Authenticating...' : 'Login'}
        </button>
        <div style={{ marginTop: '1rem', color: '#3d2808', fontSize: '11px', textAlign: 'center' }}>
          /admin — authorized personnel only
        </div>
      </form>
    </div>
  );
}
