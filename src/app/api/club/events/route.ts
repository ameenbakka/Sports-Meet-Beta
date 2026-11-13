import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { EventModel } from '@/lib/models/Event';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { Participant } from '@/lib/models/Participant';
import { getSession } from '@/lib/auth';
import '@/lib/models/Category';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.clubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();

    const [events, registrations, myParticipants] = await Promise.all([
      EventModel.find({ tenantId: tenant._id })
        .populate('categoryId')
        .sort({ orderIndex: 1, name: 1 })
        .lean(),
      EventRegistration.find({ tenantId: tenant._id, clubId: session.clubId })
        .populate('participantId')
        .lean(),
      Participant.find({ tenantId: tenant._id, clubId: session.clubId })
        .populate('categoryId')
        .lean(),
    ]);

    return NextResponse.json({ events, registrations, myParticipants });
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
    const { eventId, participantId } = body;

    const event = await EventModel.findOne({ _id: eventId, tenantId: tenant._id });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check club participant count for this event
    const currentCount = await EventRegistration.countDocuments({
      tenantId: tenant._id,
      eventId,
      clubId: session.clubId,
    });

    if (currentCount >= event.maxParticipantsPerClub) {
      return NextResponse.json(
        { error: `Maximum of ${event.maxParticipantsPerClub} participants allowed per club for this event` },
        { status: 400 }
      );
    }

    // Verify participant belongs to this club
    const participant = await Participant.findOne({
      _id: participantId,
      tenantId: tenant._id,
      clubId: session.clubId,
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found in your club' }, { status: 404 });
    }

    // Check if already registered
    const existing = await EventRegistration.findOne({
      tenantId: tenant._id,
      eventId,
      participantId,
    });

    if (existing) {
      return NextResponse.json({ error: 'Participant is already registered for this event' }, { status: 409 });
    }

    const reg = await EventRegistration.create({
      tenantId: tenant._id,
      eventId,
      clubId: session.clubId,
      participantId,
    });

    return NextResponse.json({ success: true, registration: reg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.clubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();
    const { searchParams } = new URL(req.url);
    const regId = searchParams.get('id');

    if (!regId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    await EventRegistration.findOneAndDelete({
      _id: regId,
      tenantId: tenant._id,
      clubId: session.clubId,
    });

    return NextResponse.json({ success: true, message: 'Un-registered successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
