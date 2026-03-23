import { NextRequest, NextResponse } from 'next/server';
import { logVisit, logCommand } from '../../../lib/db/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'visit') {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
      let country: string | undefined;
      let city:    string | undefined;

      try {
        if (ip && process.env.IPINFO_TOKEN) {
          const geoRes = await fetch(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);
          const geo    = await geoRes.json();
          country = geo.country;
          city    = geo.city;
        }
      } catch {}

      await logVisit({
        country,
        city,
        referrer:  req.headers.get('referer') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      });
    } else if (type === 'command') {
      const { command, sessionId } = body;
      if (command) {
        await logCommand({ command, sessionId });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[analytics POST]', err);
    return NextResponse.json({ error: 'Analytics error' }, { status: 500 });
  }
}
