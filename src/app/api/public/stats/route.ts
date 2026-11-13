import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Club } from '@/lib/models/Club';
import { EventModel } from '@/lib/models/Event';
import { Participant } from '@/lib/models/Participant';
import { Category } from '@/lib/models/Category';

export async function GET() {
  try {
    await connectDB();
    const tenant = await getCurrentTenant();

    const [clubs, totalEvents, completedEvents, totalParticipants, categories] = await Promise.all([
      Club.find({ tenantId: tenant._id, status: 'APPROVED' })
        .sort({ totalPoints: -1, goldCount: -1, silverCount: -1, bronzeCount: -1 })
        .lean(),
      EventModel.countDocuments({ tenantId: tenant._id }),
      EventModel.countDocuments({ tenantId: tenant._id, status: 'COMPLETED' }),
      Participant.countDocuments({ tenantId: tenant._id }),
      Category.find({ tenantId: tenant._id }).sort({ displayOrder: 1 }).lean(),
    ]);

    return NextResponse.json({
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subtitle: tenant.subtitle,
        settings: tenant.settings,
      },
      leaderboard: clubs,
      stats: {
        totalClubs: clubs.length,
        totalEvents,
        completedEvents,
        totalParticipants,
      },
      categories,
    });
  } catch (error: any) {
    console.error('Public stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
