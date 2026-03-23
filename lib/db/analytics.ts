import { supabaseAdmin } from './client';

export async function logVisit(params: {
  country?: string;
  city?: string;
  referrer?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await supabaseAdmin.from('visits').insert({
      country:    params.country    ?? null,
      city:       params.city       ?? null,
      referrer:   params.referrer   ?? null,
      user_agent: params.userAgent  ?? null,
    });
  } catch (err) {
    console.error('[analytics] logVisit error:', err);
  }
}

export async function logCommand(params: {
  command: string;
  sessionId?: string;
  country?: string;
}): Promise<void> {
  try {
    // Normalize the command (just the verb, not the full args)
    const verb = params.command.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
    await supabaseAdmin.from('command_logs').insert({
      command:    verb,
      session_id: params.sessionId ?? null,
      country:    params.country   ?? null,
    });
  } catch (err) {
    console.error('[analytics] logCommand error:', err);
  }
}

export async function getStats() {
  const [visitsRes, commandsRes] = await Promise.all([
    supabaseAdmin
      .from('visits')
      .select('country, created_at'),
    supabaseAdmin
      .from('command_logs')
      .select('command, created_at, country'),
  ]);

  return {
    visits:   visitsRes.data ?? [],
    commands: commandsRes.data ?? [],
  };
}

export async function getCommandCounts(): Promise<Array<{ command: string; count: number }>> {
  const { data } = await supabaseAdmin
    .from('command_logs')
    .select('command');

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.command] = (counts[row.command] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([command, count]) => ({ command, count }))
    .sort((a, b) => b.count - a.count);
}
