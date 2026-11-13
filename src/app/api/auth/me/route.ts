import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { MeetSettings } from '@/lib/models/MeetSettings';
import { Club } from '@/lib/models/Club';
import { ensureInitialized } from '@/lib/seed';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await connectDB();
    const settings = await ensureInitialized();

    let club = null;
    if (session.clubId) {
      club = await Club.findById(session.clubId);
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
      settings: {
        name: settings.name,
        subtitle: settings.subtitle,
        eventYear: settings.eventYear,
      },
      club,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
