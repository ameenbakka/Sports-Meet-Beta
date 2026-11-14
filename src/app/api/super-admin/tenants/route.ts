import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tenant } from '@/lib/models/Tenant';
import { MeetSettings } from '@/lib/models/MeetSettings';
import { User } from '@/lib/models/User';
import { Club } from '@/lib/models/Club';
import { EventModel } from '@/lib/models/Event';
import { Participant } from '@/lib/models/Participant';
import { getSession, hashPassword, isSuperAdmin } from '@/lib/auth';
import { seedTenantDefaultCategories } from '@/lib/seed';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    await connectDB();
    const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();

    // Attach statistics for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (t) => {
        const [clubCount, eventCount, participantCount] = await Promise.all([
          Club.countDocuments({ tenantId: t._id }),
          EventModel.countDocuments({ tenantId: t._id }),
          Participant.countDocuments({ tenantId: t._id }),
        ]);

        return {
          ...t,
          clubCount,
          eventCount,
          participantCount,
          subdomainUrl: `https://${t.slug}.kalolsavam.online`,
        };
      })
    );

    return NextResponse.json({ tenants: tenantsWithStats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { name, slug, contactEmail, contactPhone, adminPassword, venue, meetDates } = body;

    if (!name || !slug || !contactEmail) {
      return NextResponse.json(
        { error: 'Institution Name, Subdomain Slug, and Contact Email are required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return NextResponse.json(
        { error: 'Subdomain slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const existingTenant = await Tenant.findOne({ slug: cleanSlug });
    if (existingTenant) {
      return NextResponse.json(
        { error: `The subdomain '${cleanSlug}.kalolsavam.online' is already registered` },
        { status: 400 }
      );
    }

    // 1. Create Tenant
    const tenant = await Tenant.create({
      name: name.trim(),
      slug: cleanSlug,
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone ? contactPhone.trim() : undefined,
      status: 'ACTIVE',
      settings: {
        firstPlacePoints: 5,
        secondPlacePoints: 3,
        thirdPlacePoints: 1,
        fourthPlacePoints: 0,
        themeColor: '#2563eb',
        venue: venue ? venue.trim() : '',
        meetDates: meetDates ? meetDates.trim() : '',
      },
    });

    // 2. Create MeetSettings
    await MeetSettings.create({
      tenantId: tenant._id,
      name: tenant.name,
      subtitle: 'Sports & Athletic Championship',
      eventYear: new Date().getFullYear().toString(),
      themeColor: '#2563eb',
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      defaultPoints: { first: 5, second: 3, third: 1 },
    });

    // 3. Create Tenant Admin
    const initialPassword = adminPassword && adminPassword.trim().length >= 6
      ? adminPassword.trim()
      : 'Admin@123';
    const passwordHash = await hashPassword(initialPassword);

    const adminUser = await User.create({
      tenantId: tenant._id,
      username: 'admin',
      name: `${tenant.name} Admin`,
      email: tenant.contactEmail,
      role: 'ADMIN',
      passwordHash,
      isActive: true,
    });

    // 4. Seed Default Categories
    await seedTenantDefaultCategories(tenant._id as mongoose.Types.ObjectId);

    return NextResponse.json({
      success: true,
      tenant,
      adminCredentials: {
        username: 'admin',
        password: initialPassword,
        loginUrl: `https://${cleanSlug}.kalolsavam.online/login`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { tenantId, status } = body;

    if (!tenantId || !status) {
      return NextResponse.json({ error: 'tenantId and status are required' }, { status: 400 });
    }

    const updated = await Tenant.findByIdAndUpdate(tenantId, { status }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tenant: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
