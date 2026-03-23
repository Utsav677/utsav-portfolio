import { NextRequest, NextResponse } from 'next/server';
import {
  getAllEntries, setApproved, deleteEntry,
} from '../../../lib/db/guestbook';
import { getStats, getCommandCounts } from '../../../lib/db/analytics';

function checkAuth(req: NextRequest): boolean {
  const password  = process.env.ADMIN_PASSWORD;
  const provided  = req.headers.get('x-admin-password');
  return !!password && provided === password;
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource');

  if (resource === 'guestbook') {
    const entries = await getAllEntries();
    return NextResponse.json(entries);
  }

  if (resource === 'stats') {
    const [stats, commandCounts] = await Promise.all([getStats(), getCommandCounts()]);
    return NextResponse.json({ stats, commandCounts });
  }

  return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const { id, approved } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await setApproved(id, approved ?? true);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await deleteEntry(id);
  return NextResponse.json({ ok: true });
}
