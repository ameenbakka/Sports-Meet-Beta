import { headers } from 'next/headers';
import { connectDB } from './db';
import { Tenant, ITenant } from './models/Tenant';
import { User } from './models/User';
import { Category } from './models/Category';
import { hashPassword } from './auth';

export async function resolveTenantSlug(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const xTenant = headersList.get('x-tenant-slug');

  if (xTenant) return xTenant.toLowerCase();

  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // If running on Vercel (e.g. sports-meet-beta-ph5gkh3kk-ameen-6962.vercel.app or sports-meet-beta.vercel.app)
  if (cleanHost.includes('vercel.app')) {
    // Only if there are 4 or more parts (e.g. cherukavu.sports-meet-beta.vercel.app), parts[0] is the tenant
    if (parts.length > 3) {
      return parts[0];
    }
    return 'cherukavu'; // Default for the root Vercel app
  }

  // Localhost (e.g. cherukavu.localhost:3000)
  if (cleanHost.includes('localhost')) {
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return 'cherukavu';
  }

  // Custom domain (e.g. cherukavu.sportsmeet.online has 3 parts: cherukavu, sportsmeet, online)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain !== 'www') {
      return subdomain;
    }
  }

  return 'cherukavu'; // Default tenant slug
}

export async function getCurrentTenant(): Promise<any> {
  await connectDB();
  const slug = await resolveTenantSlug();

  let tenant = await Tenant.findOne({ slug });

  if (!tenant) {
    // If cherukavu doesn't exist, create default tenant along with default categories & admin
    if (slug === 'cherukavu') {
      tenant = await seedDefaultTenant();
    } else {
      // Create new tenant on the fly for seamless SaaS onboarding
      tenant = await Tenant.create({
        name: `${slug.toUpperCase()} Sports Meet`,
        slug: slug,
        subtitle: 'Annual Sports & Athletic Championship',
        settings: {
          defaultPoints: { first: 5, second: 3, third: 1 },
          eventYear: '2024-25',
          themeColor: '#2563eb',
        },
      });

      // Also create an admin user for this new tenant
      const passwordHash = await hashPassword('Admin@123');
      await User.create({
        tenantId: tenant._id,
        username: 'admin',
        name: `${slug.toUpperCase()} Sports Admin`,
        role: 'TENANT_ADMIN',
        passwordHash,
      });

      // Seed standard categories
      await seedCategoriesForTenant(tenant._id);
    }
  }

  return tenant;
}

export async function seedCategoriesForTenant(tenantId: any) {
  const categories = [
    { name: 'Sub-Junior Boys', code: 'SJB', gender: 'MALE', minAge: 10, maxAge: 12, displayOrder: 1 },
    { name: 'Sub-Junior Girls', code: 'SJG', gender: 'FEMALE', minAge: 10, maxAge: 12, displayOrder: 2 },
    { name: 'Junior Boys', code: 'JB', gender: 'MALE', minAge: 13, maxAge: 15, displayOrder: 3 },
    { name: 'Junior Girls', code: 'JG', gender: 'FEMALE', minAge: 13, maxAge: 15, displayOrder: 4 },
    { name: 'Senior Boys', code: 'SB', gender: 'MALE', minAge: 16, maxAge: 18, displayOrder: 5 },
    { name: 'Senior Girls', code: 'SG', gender: 'FEMALE', minAge: 16, maxAge: 18, displayOrder: 6 },
    { name: 'General / Open', code: 'GEN', gender: 'ALL', minAge: 10, maxAge: 99, displayOrder: 7 },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { tenantId, code: cat.code },
      { ...cat, tenantId },
      { upsert: true, new: true }
    );
  }
}

export async function seedDefaultTenant(): Promise<any> {
  await connectDB();

  let tenant = await Tenant.findOne({ slug: 'cherukavu' });
  if (!tenant) {
    tenant = await Tenant.create({
      name: 'ചെറുകാവ് ഗ്രാമപഞ്ചായത്ത് കേരളോത്സവം 2024',
      slug: 'cherukavu',
      subtitle: 'Sports & Athletic Meet - Cherukavu Grama Panchayat',
      bannerUrl: '',
      settings: {
        defaultPoints: { first: 5, second: 3, third: 1 },
        eventYear: '2024-25',
        themeColor: '#2563eb',
        contactEmail: 'cherukavu.sports@keralotsavam.online',
        contactPhone: '+91 98765 43210',
      },
    });
  }

  // Seed Admin user: admin / Admin@123
  const existingAdmin = await User.findOne({ tenantId: tenant._id, username: 'admin' });
  if (!existingAdmin) {
    const passwordHash = await hashPassword('Admin@123');
    await User.create({
      tenantId: tenant._id,
      username: 'admin',
      name: 'Cherukavu Sports Council Admin',
      email: 'admin@cherukavu.sportsmeet',
      role: 'TENANT_ADMIN',
      passwordHash,
    });
  }

  // Seed standard categories
  await seedCategoriesForTenant(tenant._id);

  return tenant;
}
