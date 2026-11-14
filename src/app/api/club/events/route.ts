import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventModel } from '@/lib/models/Event';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { Participant } from '@/lib/models/Participant';
import { Club } from '@/lib/models/Club';
import { getSession } from '@/lib/auth';
import '@/lib/models/Category';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.clubId) {
      return NextResponse.json({ error: 'Unauthorized or not a club manager' }, { status: 403 });
    }

    await connectDB();
    const club = await Club.findById(session.clubId);
    const tenantId = session.tenantId || club?.tenantId;

    const [events, registrations, myParticipants] = await Promise.all([
      EventModel.find(tenantId ? { tenantId } : {})
        .populate('categoryId')
        .sort({ orderIndex: 1, name: 1 })
        .lean(),
      EventRegistration.find({ clubId: session.clubId })
        .populate('participantId')
        .lean(),
      Participant.find({ clubId: session.clubId })
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
      return NextResponse.json({ error: 'Unauthorized or not a club manager' }, { status: 403 });
    }

    await connectDB();
    const club = await Club.findById(session.clubId);
    const tenantId = session.tenantId || club?.tenantId;

    const body = await req.json();
    const { eventId, participantId } = body;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check club participant count for this event
    const currentCount = await EventRegistration.countDocuments({
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
      clubId: session.clubId,
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found in your club' }, { status: 404 });
    }

    // Check if already registered
    const existing = await EventRegistration.findOne({
      eventId,
      participantId,
    });

    if (existing) {
      return NextResponse.json({ error: 'Participant is already registered for this event' }, { status: 409 });
    }

    const reg = await EventRegistration.create({
      tenantId: tenantId || event.tenantId,
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
    const { searchParams } = new URL(req.url);
    const regId = searchParams.get('id');

    if (!regId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    await EventRegistration.findOneAndDelete({
      _id: regId,
      clubId: session.clubId,
    });

    return NextResponse.json({ success: true, message: 'Un-registered successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
