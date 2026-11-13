import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Club } from '@/lib/models/Club';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();

    let club = null;
    if (session.clubId) {
      club = await Club.findById(session.clubId);
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        subtitle: tenant.subtitle,
      },
      club,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
