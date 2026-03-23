'use client';

import { useState, useEffect, useCallback } from 'react';

interface GuestbookEntry {
  id: string;
  created_at: string;
  name: string;
  message: string;
  country: string | null;
  approved: boolean;
}

interface Stats {
  visits: Array<{ country: string; created_at: string }>;
  commands: Array<{ command: string; created_at: string; country: string }>;
}

interface CommandCount {
  command: string;
  count: number;
}

type Tab = 'guestbook' | 'analytics' | 'commands';

interface Props {
  adminPassword: string;
  onLogout: () => void;
}

export default function AdminPanel({ adminPassword, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('guestbook');
  const [entries, setEntries]       = useState<GuestbookEntry[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [commandCounts, setCommandCounts] = useState<CommandCount[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const headers = { 'x-admin-password': adminPassword, 'Content-Type': 'application/json' };

  const fetchGuestbook = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin?resource=guestbook', { headers: { 'x-admin-password': adminPassword } });
      if (!res.ok) throw new Error('Unauthorized');
      setEntries(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin?resource=stats', { headers: { 'x-admin-password': adminPassword } });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setStats(data.stats);
      setCommandCounts(data.commandCounts ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    if (tab === 'guestbook') fetchGuestbook();
    if (tab === 'analytics' || tab === 'commands') fetchStats();
  }, [tab, fetchGuestbook, fetchStats]);

  const toggleApprove = async (id: string, approved: boolean) => {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id, approved: !approved }),
    });
    await fetchGuestbook();
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/admin?id=${id}`, { method: 'DELETE', headers });
    await fetchGuestbook();
  };

  const totalVisits   = stats?.visits.length ?? 0;
  const uniqueCountries = new Set(stats?.visits.map(v => v.country).filter(Boolean)).size;
  const todayVisits   = stats?.visits.filter(v => {
    const d = new Date(v.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length ?? 0;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <span>ARORA.SYS — Admin Panel</span>
        <button
          className="admin-btn"
          onClick={onLogout}
          style={{ float: 'right' }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '1.5rem' }}>
        {(['guestbook', 'analytics', 'commands'] as Tab[]).map(t => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: 'var(--amber-err)', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {loading && (
        <div style={{ color: 'var(--amber-dim)' }}>Loading...</div>
      )}

      {/* Guestbook Tab */}
      {tab === 'guestbook' && !loading && (
        <>
          <div style={{ color: 'var(--amber-dim)', marginBottom: '1rem' }}>
            {entries.length} entries · {entries.filter(e => e.approved).length} approved
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Message</th>
                <th>Country</th>
                <th>Date</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} style={{ opacity: entry.approved ? 1 : 0.5 }}>
                  <td style={{ color: 'var(--amber-bright)' }}>{entry.name}</td>
                  <td style={{ maxWidth: 300 }}>{entry.message}</td>
                  <td style={{ color: 'var(--amber-dim)' }}>{entry.country ?? '—'}</td>
                  <td style={{ color: 'var(--amber-dim)', whiteSpace: 'nowrap' }}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ color: entry.approved ? 'var(--amber-ok)' : 'var(--amber-err)' }}>
                    {entry.approved ? 'YES' : 'NO'}
                  </td>
                  <td>
                    <button
                      className="admin-btn"
                      onClick={() => toggleApprove(entry.id, entry.approved)}
                    >
                      {entry.approved ? 'Unapprove' : 'Approve'}
                    </button>
                    {' '}
                    <button
                      className="admin-btn danger"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && !loading && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Visits',      value: totalVisits },
              { label: 'Today',             value: todayVisits },
              { label: 'Unique Countries',  value: uniqueCountries },
            ].map(({ label, value }) => (
              <div key={label} style={{
                border: '1px solid var(--amber-dimmer)',
                padding: '1rem',
                textAlign: 'center',
              }}>
                <div style={{ color: 'var(--amber-bright)', fontSize: '24px' }}>{value}</div>
                <div style={{ color: 'var(--amber-dim)', fontSize: '11px' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ color: 'var(--amber-dim)', marginBottom: '0.5rem' }}>Recent visits:</div>
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Country</th></tr>
            </thead>
            <tbody>
              {stats.visits.slice(0, 20).map((v, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--amber-dim)' }}>
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                  <td>{v.country ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Commands Tab */}
      {tab === 'commands' && !loading && (
        <div>
          <div style={{ color: 'var(--amber-dim)', marginBottom: '1rem' }}>
            Most used commands:
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Command</th><th>Count</th><th>Bar</th></tr>
            </thead>
            <tbody>
              {commandCounts.slice(0, 30).map(({ command, count }) => {
                const max = commandCounts[0]?.count ?? 1;
                const pct = Math.round(count / max * 100);
                return (
                  <tr key={command}>
                    <td style={{ color: 'var(--amber-bright)' }}>{command}</td>
                    <td style={{ color: 'var(--amber-dim)' }}>{count}</td>
                    <td>
                      <div style={{
                        height: 4,
                        width: `${pct}%`,
                        background: 'var(--amber)',
                        maxWidth: 200,
                      }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
