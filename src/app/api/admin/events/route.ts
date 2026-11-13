import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { EventModel } from '@/lib/models/Event';
import { Category } from '@/lib/models/Category';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'TENANT_ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();

    const [events, categories] = await Promise.all([
      EventModel.find({ tenantId: tenant._id })
        .populate('categoryId')
        .sort({ orderIndex: 1, createdAt: -1 })
        .lean(),
      Category.find({ tenantId: tenant._id }).sort({ displayOrder: 1 }).lean(),
    ]);

    return NextResponse.json({ events, categories });
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
    } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Event name and category are required' }, { status: 400 });
    }

    if (id) {
      // Update
      const updated = await EventModel.findOneAndUpdate(
        { _id: id, tenantId: tenant._id },
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
      tenantId: tenant._id,
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
    if (!session || (session.role !== 'TENANT_ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    await EventModel.findOneAndDelete({ _id: id, tenantId: tenant._id });

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
