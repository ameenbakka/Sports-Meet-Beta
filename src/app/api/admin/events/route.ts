import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventModel } from '@/lib/models/Event';
import { Category } from '@/lib/models/Category';
import { getSession, isAdminRole } from '@/lib/auth';

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

    const [events, categories] = await Promise.all([
      EventModel.find(filter)
        .populate('categoryId')
        .sort({ orderIndex: 1, createdAt: -1 })
        .lean(),
      Category.find(filter).sort({ displayOrder: 1 }).lean(),
    ]);

    return NextResponse.json({ events, categories });
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

    const {
      id,
      name,
      categoryId,
      type,
      gender,
      maxParticipantsPerClub,
      pointsScheme,
      status,
      scheduleTime,
      venue,
      tenantId: bodyTenantId,
    } = body;

    const targetTenantId = session.tenantId || bodyTenantId;
    if (!targetTenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Event name and category are required' }, { status: 400 });
    }

    if (id) {
      // Update
      const updated = await EventModel.findByIdAndUpdate(
        id,
        {
          name: name.trim(),
          categoryId,
          type: type || 'INDIVIDUAL',
          gender: gender || 'MIXED',
          maxParticipantsPerClub: maxParticipantsPerClub || 2,
          pointsScheme: pointsScheme || { first: 5, second: 3, third: 1 },
          status: status || 'SCHEDULED',
          scheduleTime: scheduleTime ? new Date(scheduleTime) : undefined,
          venue: venue ? venue.trim() : undefined,
        },
        { new: true }
      );
      return NextResponse.json({ success: true, event: updated });
    }

    // Create
    const created = await EventModel.create({
      tenantId: targetTenantId,
      name: name.trim(),
      categoryId,
      type: type || 'INDIVIDUAL',
      gender: gender || 'MIXED',
      maxParticipantsPerClub: maxParticipantsPerClub || 2,
      pointsScheme: pointsScheme || { first: 5, second: 3, third: 1 },
      status: status || 'SCHEDULED',
      scheduleTime: scheduleTime ? new Date(scheduleTime) : undefined,
      venue: venue ? venue.trim() : undefined,
    });

    return NextResponse.json({ success: true, event: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    await EventModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
