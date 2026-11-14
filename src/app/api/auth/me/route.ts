import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Club } from '@/lib/models/Club';
import { Tenant } from '@/lib/models/Tenant';
import { MeetSettings } from '@/lib/models/MeetSettings';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let tenant = null;
    let settings = null;
    let club = null;

    try {
      await connectDB();
      if (session.tenantId) {
        tenant = await Tenant.findById(session.tenantId).lean();
        settings = await MeetSettings.findOne({ tenantId: session.tenantId }).lean();
      }
      if (session.clubId) {
        club = await Club.findById(session.clubId).lean();
      }
    } catch (dbErr) {
      console.error('Database warning in /api/auth/me:', dbErr);
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
      tenant,
      settings: settings || {
        name: tenant?.name || 'Sports & Athletic Championship',
        subtitle: 'Sports Meet Management Portal',
        eventYear: '2026',
      },
      club,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
