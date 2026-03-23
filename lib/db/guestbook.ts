import { supabaseAdmin, supabasePublic } from './client';

export interface GuestbookEntry {
  id: string;
  created_at: string;
  name: string;
  message: string;
  country: string | null;
  approved: boolean;
}

/** Get all approved entries (public). */
export async function getEntries(): Promise<GuestbookEntry[]> {
  const { data, error } = await supabasePublic
    .from('guestbook')
    .select('id, created_at, name, message, country, approved')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

/** Get all entries including unapproved (admin). */
export async function getAllEntries(): Promise<GuestbookEntry[]> {
  const { data, error } = await supabaseAdmin
    .from('guestbook')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Add a new guestbook entry. */
export async function addEntry(params: {
  name: string;
  message: string;
  country?: string;
}): Promise<GuestbookEntry> {
  if (!params.name.trim())    throw new Error('Name is required');
  if (!params.message.trim()) throw new Error('Message is required');
  if (params.message.length > 280) throw new Error('Message too long (max 280 chars)');

  const { data, error } = await supabaseAdmin
    .from('guestbook')
    .insert({
      name:    params.name.trim().slice(0, 50),
      message: params.message.trim(),
      country: params.country ?? null,
      approved: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Approve or unapprove an entry (admin). */
export async function setApproved(id: string, approved: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from('guestbook')
    .update({ approved })
    .eq('id', id);

  if (error) throw error;
}

/** Delete an entry (admin). */
export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('guestbook')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
