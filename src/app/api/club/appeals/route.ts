import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Appeal } from '@/lib/models/Appeal';
import { EventModel } from '@/lib/models/Event';
import { getSession } from '@/lib/auth';
import '@/lib/models/Participant';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.clubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();

    const appeals = await Appeal.find({
      tenantId: tenant._id,
      clubId: session.clubId,
    })
      .populate('eventId')
      .populate('participantId')
      .sort({ createdAt: -1 });

    const completedEvents = await EventModel.find({
      tenantId: tenant._id,
      status: 'COMPLETED',
    }).sort({ name: 1 });

    return NextResponse.json({ appeals, completedEvents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.clubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();
    const body = await req.json();

    const { eventId, participantId, subject, description, evidenceUrl } = body;

    if (!eventId || !subject || !description) {
      return NextResponse.json(
        { error: 'Event, Subject, and Description are required' },
        { status: 400 }
      );
    }

    const newAppeal = await Appeal.create({
      tenantId: tenant._id,
      eventId,
      clubId: session.clubId,
      participantId: participantId || undefined,
      subject: subject.trim(),
      description: description.trim(),
      evidenceUrl: evidenceUrl ? evidenceUrl.trim() : undefined,
      status: 'PENDING',
    });

    return NextResponse.json({
      success: true,
      message: 'Appeal submitted to the Admin desk',
      appeal: newAppeal,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
