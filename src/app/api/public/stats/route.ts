import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ensureInitialized } from '@/lib/seed';
import { Club } from '@/lib/models/Club';
import { EventModel } from '@/lib/models/Event';
import { Participant } from '@/lib/models/Participant';
import { Category } from '@/lib/models/Category';

export async function GET() {
  try {
    await connectDB();
    const settings = await ensureInitialized();

    const [clubs, totalEvents, completedEvents, totalParticipants, categories] = await Promise.all([
      Club.find({ status: 'APPROVED' })
        .sort({ totalPoints: -1, goldCount: -1, silverCount: -1, bronzeCount: -1 })
        .lean(),
      EventModel.countDocuments(),
      EventModel.countDocuments({ status: 'COMPLETED' }),
      Participant.countDocuments(),
      Category.find().sort({ displayOrder: 1 }).lean(),
    ]);

    return NextResponse.json({
      settings: {
        name: settings.name,
        subtitle: settings.subtitle,
        eventYear: settings.eventYear,
        defaultPoints: settings.defaultPoints,
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
