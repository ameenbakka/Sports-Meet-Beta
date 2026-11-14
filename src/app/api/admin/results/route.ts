import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Result } from '@/lib/models/Result';
import { EventModel } from '@/lib/models/Event';
import { recalculateAllClubPoints } from '@/lib/points';
import { getSession, isAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const filter: any = {};
    if (session.tenantId) {
      filter.tenantId = session.tenantId;
    }
    if (eventId) filter.eventId = eventId;

    const results = await Result.find(filter).populate('eventId');
    return NextResponse.json({ results });
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

    const { eventId, firstPlace, secondPlace, thirdPlace, notes } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const tenantId = event.tenantId || session.tenantId;

    // Upsert Result with tenantId
    const savedResult = await Result.findOneAndUpdate(
      { tenantId, eventId },
      {
        tenantId,
        eventId,
        firstPlace,
        secondPlace,
        thirdPlace,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        notes,
      },
      { upsert: true, new: true }
    );

    // Update Event status to COMPLETED
    await EventModel.findByIdAndUpdate(eventId, { status: 'COMPLETED' });

    // Recalculate club point aggregates for this tenant
    await recalculateAllClubPoints(tenantId);

    return NextResponse.json({
      success: true,
      message: 'Result published and points updated',
      result: savedResult,
    });
  } catch (error: any) {
    console.error('Publish result error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
