import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Club } from '@/lib/models/Club';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getCurrentTenant();
    const body = await req.json();

    const { name, code, convenerName, phone, email, place, color } = body;

    if (!name || !code || !convenerName || !phone) {
      return NextResponse.json(
        { error: 'Club Name, Code, Convener Name, and Phone are required' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code or name already registered under this tenant
    const existing = await Club.findOne({
      tenantId: tenant._id,
      $or: [{ code: cleanCode }, { name: name.trim() }],
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A club with this Name or Code already exists in this Sports Meet' },
        { status: 409 }
      );
    }

    const newClub = await Club.create({
      tenantId: tenant._id,
      name: name.trim(),
      code: cleanCode,
      convenerName: convenerName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      place: place ? place.trim() : undefined,
      color: color || '#3b82f6',
      status: 'PENDING',
      totalPoints: 0,
      goldCount: 0,
      silverCount: 0,
      bronzeCount: 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully! Credentials will be issued after Admin approval.',
      club: newClub,
    });
  } catch (error: any) {
    console.error('Club registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
