import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Club } from '@/lib/models/Club';
import { User } from '@/lib/models/User';
import { getSession, generateRandomPassword, hashPassword, isAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const filter: any = {};
    if (session.tenantId) {
      filter.tenantId = session.tenantId;
    } else {
      const { searchParams } = new URL(req.url);
      const queryTenantId = searchParams.get('tenantId');
      if (queryTenantId) filter.tenantId = queryTenantId;
    }

    const clubs = await Club.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ clubs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { action, clubId, pointsAdjustment } = body;

    const club = await Club.findById(clubId);
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      const username = `club_${club.code.toLowerCase()}`;
      const plainPassword = generateRandomPassword(8);
      const passwordHash = await hashPassword(plainPassword);

      // Create or update user account for this club with tenantId
      await User.findOneAndUpdate(
        { tenantId: club.tenantId, username },
        {
          tenantId: club.tenantId,
          username,
          passwordHash,
          role: 'CLUB_MANAGER',
          clubId: club._id,
          name: `${club.name} Manager`,
          email: club.email,
          phone: club.phone,
          isActive: true,
        },
        { upsert: true, new: true }
      );

      club.status = 'APPROVED';
      club.generatedCredentials = {
        username,
        initialPassword: plainPassword,
      };
      await club.save();

      return NextResponse.json({
        success: true,
        credentials: {
          username,
          password: plainPassword,
          clubName: club.name,
        },
      });
    }

    if (action === 'REJECT') {
      club.status = 'REJECTED';
      await club.save();
      return NextResponse.json({ success: true, club });
    }

    if (action === 'ADJUST_POINTS') {
      club.totalPoints = Math.max(0, (club.totalPoints || 0) + Number(pointsAdjustment || 0));
      await club.save();
      return NextResponse.json({ success: true, club });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
