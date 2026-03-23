import { NextRequest, NextResponse } from 'next/server';
import { getEntries, addEntry } from '../../../lib/db/guestbook';

export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json(entries);
  } catch (err) {
    console.error('[guestbook GET]', err);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'name and message are required' }, { status: 400 });
    }

    // Geolocation from IP
    let country: string | undefined;
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
               ?? req.headers.get('x-real-ip')
               ?? '';
      if (ip && process.env.IPINFO_TOKEN) {
        const geoRes = await fetch(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);
        const geo    = await geoRes.json();
        country = geo.country;
      }
    } catch {
      // Geolocation is non-critical
    }

    const entry = await addEntry({ name, message, country });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: any) {
    console.error('[guestbook POST]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to add entry' }, { status: 500 });
  }
}
