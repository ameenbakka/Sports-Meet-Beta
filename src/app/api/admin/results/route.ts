import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Result } from '@/lib/models/Result';
import { EventModel } from '@/lib/models/Event';
import { recalculateAllClubPoints } from '@/lib/points';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'TENANT_ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const filter: any = { tenantId: tenant._id };
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
    if (!session || (session.role !== 'TENANT_ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();
    const body = await req.json();

    const { eventId, firstPlace, secondPlace, thirdPlace, notes } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Upsert Result
    const savedResult = await Result.findOneAndUpdate(
      { tenantId: tenant._id, eventId },
      {
        tenantId: tenant._id,
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

    // Recalculate club point aggregates
    await recalculateAllClubPoints(tenant._id);

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
