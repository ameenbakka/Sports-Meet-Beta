import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Club } from '@/lib/models/Club';
import { ensureInitialized } from '@/lib/seed';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let settings = null;
    let club = null;

    try {
      await connectDB();
      settings = await ensureInitialized();
      if (session.clubId) {
        club = await Club.findById(session.clubId);
      }
    } catch (dbErr) {
      console.error('Database warning in /api/auth/me:', dbErr);
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
      settings: {
        name: settings?.name || 'ചെറുകാവ് ഗ്രാമപഞ്ചായത്ത് കേരളോത്സവം 2024',
        subtitle: settings?.subtitle || 'Sports & Athletic Championship',
        eventYear: settings?.eventYear || '2024-25',
      },
      club,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
