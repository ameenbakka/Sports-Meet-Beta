import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Appeal } from '@/lib/models/Appeal';
import { getSession, isAdminRole } from '@/lib/auth';
import '@/lib/models/Event';
import '@/lib/models/Club';
import '@/lib/models/Participant';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const filter: any = {};
    if (session.tenantId) {
      filter.tenantId = session.tenantId;
    }

    const appeals = await Appeal.find(filter)
      .populate('eventId')
      .populate('clubId')
      .populate('participantId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ appeals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { appealId, status, adminRemarks } = body;

    const appeal = await Appeal.findByIdAndUpdate(
      appealId,
      {
        status,
        adminRemarks,
        resolvedAt: status.startsWith('RESOLVED') ? new Date() : undefined,
      },
      { new: true }
    );

    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, appeal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
