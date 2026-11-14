import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Participant } from '@/lib/models/Participant';
import { Category } from '@/lib/models/Category';
import { Club } from '@/lib/models/Club';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.clubId) {
      return NextResponse.json({ error: 'Unauthorized or not a club manager' }, { status: 403 });
    }

    await connectDB();
    const club = await Club.findById(session.clubId);
    const tenantId = session.tenantId || club?.tenantId;

    const [participants, categories] = await Promise.all([
      Participant.find({ clubId: session.clubId })
        .populate('categoryId')
        .sort({ chestNumber: 1 }),
      Category.find(tenantId ? { tenantId } : {}).sort({ displayOrder: 1 }),
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
    const club = await Club.findById(session.clubId);
    const tenantId = session.tenantId || club?.tenantId;

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
      tenantId,
      chestNumber: cleanChestNo,
      _id: { $ne: id },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Chest number ${cleanChestNo} is already assigned to another participant in this meet` },
        { status: 409 }
      );
    }

    if (id) {
      // Update
      const updated = await Participant.findOneAndUpdate(
        { _id: id, clubId: session.clubId },
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
      tenantId,
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await Participant.findOneAndDelete({
      _id: id,
      clubId: session.clubId,
    });

    return NextResponse.json({ success: true, message: 'Participant deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
