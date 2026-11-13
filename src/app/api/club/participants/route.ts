import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Participant } from '@/lib/models/Participant';
import { Category } from '@/lib/models/Category';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.clubId) {
      return NextResponse.json({ error: 'Unauthorized or not a club manager' }, { status: 403 });
    }

    await connectDB();
    const tenant = await getCurrentTenant();

    const [participants, categories] = await Promise.all([
      Participant.find({ tenantId: tenant._id, clubId: session.clubId })
        .populate('categoryId')
        .sort({ chestNumber: 1 }),
      Category.find({ tenantId: tenant._id }).sort({ displayOrder: 1 }),
    ]);

    return NextResponse.json({ participants, categories });
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
    const tenant = await getCurrentTenant();
    const body = await req.json();

    const { id, name, chestNumber, categoryId, gender, dob, phone } = body;

    if (!name || !chestNumber || !categoryId || !gender) {
      return NextResponse.json(
        { error: 'Name, chest number, category, and gender are required' },
        { status: 400 }
      );
    }

    const cleanChestNo = chestNumber.trim().toUpperCase();

    // Check if chest number is unique within this tenant
    const existing = await Participant.findOne({
      tenantId: tenant._id,
      chestNumber: cleanChestNo,
      _id: { $ne: id },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Chest number ${cleanChestNo} is already assigned to another participant` },
        { status: 409 }
      );
    }

    if (id) {
      // Update
      const updated = await Participant.findOneAndUpdate(
        { _id: id, tenantId: tenant._id, clubId: session.clubId },
        {
          name: name.trim(),
          chestNumber: cleanChestNo,
          categoryId,
          gender,
          dob: dob ? new Date(dob) : undefined,
          phone: phone ? phone.trim() : undefined,
        },
        { new: true }
      );
      return NextResponse.json({ success: true, participant: updated });
    }

    // Create
    const created = await Participant.create({
      tenantId: tenant._id,
      clubId: session.clubId,
      categoryId,
      name: name.trim(),
      chestNumber: cleanChestNo,
      gender,
      dob: dob ? new Date(dob) : undefined,
      phone: phone ? phone.trim() : undefined,
    });

    return NextResponse.json({ success: true, participant: created });
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await Participant.findOneAndDelete({
      _id: id,
      tenantId: tenant._id,
      clubId: session.clubId,
    });

    return NextResponse.json({ success: true, message: 'Participant deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
