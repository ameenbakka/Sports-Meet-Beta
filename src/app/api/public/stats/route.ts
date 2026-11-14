import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ensureInitialized } from '@/lib/seed';
import { Tenant } from '@/lib/models/Tenant';
import { MeetSettings } from '@/lib/models/MeetSettings';
import { Club } from '@/lib/models/Club';
import { EventModel } from '@/lib/models/Event';
import { Participant } from '@/lib/models/Participant';
import { Category } from '@/lib/models/Category';
import { getTenantSlugFromHost } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await ensureInitialized();

    const host = req.headers.get('host') || '';
    let tenantSlug = req.headers.get('x-tenant-slug') || getTenantSlugFromHost(host);
    const queryTenant = req.nextUrl.searchParams.get('tenant');
    if (queryTenant) {
      tenantSlug = queryTenant.toLowerCase();
    }

    // 1. If Tenant Subdomain
    if (tenantSlug) {
      const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase(), status: 'ACTIVE' });
      if (tenant) {
        let settings = await MeetSettings.findOne({ tenantId: tenant._id }).lean();
        if (!settings) {
          settings = {
            name: tenant.name,
            subtitle: 'Sports & Athletic Championship',
            eventYear: new Date().getFullYear().toString(),
            themeColor: tenant.settings?.themeColor || '#2563eb',
            defaultPoints: { first: 5, second: 3, third: 1 },
          } as any;
        }

        const [clubs, totalEvents, completedEvents, totalParticipants, categories] = await Promise.all([
          Club.find({ tenantId: tenant._id, status: 'APPROVED' })
            .sort({ totalPoints: -1, goldCount: -1, silverCount: -1, bronzeCount: -1 })
            .lean(),
          EventModel.countDocuments({ tenantId: tenant._id }),
          EventModel.countDocuments({ tenantId: tenant._id, status: 'COMPLETED' }),
          Participant.countDocuments({ tenantId: tenant._id }),
          Category.find({ tenantId: tenant._id }).sort({ displayOrder: 1 }).lean(),
        ]);

        return NextResponse.json({
          isRoot: false,
          tenant: {
            id: tenant._id,
            name: tenant.name,
            slug: tenant.slug,
            venue: tenant.settings?.venue,
            meetDates: tenant.settings?.meetDates,
            themeColor: tenant.settings?.themeColor,
          },
          settings,
          leaderboard: clubs,
          stats: {
            totalClubs: clubs.length,
            totalEvents,
            completedEvents,
            totalParticipants,
          },
          categories,
        });
      }
    }

    // 2. If Root Domain (kalolsavam.online / localhost)
    const activeTenants = await Tenant.find({ status: 'ACTIVE' })
      .select('name slug settings contactEmail createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const [totalInstitutions, totalClubs, totalParticipants, totalEvents] = await Promise.all([
      Tenant.countDocuments({ status: 'ACTIVE' }),
      Club.countDocuments({ status: 'APPROVED' }),
      Participant.countDocuments(),
      EventModel.countDocuments(),
    ]);

    return NextResponse.json({
      isRoot: true,
      tenants: activeTenants.map((t) => ({
        id: t._id,
        name: t.name,
        slug: t.slug,
        venue: t.settings?.venue,
        meetDates: t.settings?.meetDates,
        subdomainUrl: `https://${t.slug}.kalolsavam.online`,
      })),
      stats: {
        totalInstitutions,
        totalClubs,
        totalParticipants,
        totalEvents,
      },
    });
  } catch (error: any) {
    console.error('Public stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
