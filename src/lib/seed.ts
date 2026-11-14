import { connectDB } from './db';
import { Tenant, ITenant } from './models/Tenant';
import { MeetSettings } from './models/MeetSettings';
import { User } from './models/User';
import { Category } from './models/Category';
import { hashPassword } from './auth';
import mongoose from 'mongoose';

export async function ensureSuperAdminInitialized() {
  await connectDB();

  // Check if any SUPER_ADMIN exists
  let superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
  if (!superAdmin) {
    const passwordHash = await hashPassword('Super@123');
    superAdmin = await User.create({
      username: 'superadmin',
      name: 'Kalolsavam Platform Administrator',
      email: 'admin@kalolsavam.online',
      role: 'SUPER_ADMIN',
      passwordHash,
      isActive: true,
    });
  }
  return superAdmin;
}

export async function seedTenantDefaultCategories(tenantId: mongoose.Types.ObjectId) {
  const count = await Category.countDocuments({ tenantId });
  if (count === 0) {
    const defaultCategories = [
      { tenantId, name: 'Sub-Junior Boys', code: 'SJB', gender: 'MALE', minAge: 10, maxAge: 12, displayOrder: 1 },
      { tenantId, name: 'Sub-Junior Girls', code: 'SJG', gender: 'FEMALE', minAge: 10, maxAge: 12, displayOrder: 2 },
      { tenantId, name: 'Junior Boys', code: 'JB', gender: 'MALE', minAge: 13, maxAge: 15, displayOrder: 3 },
      { tenantId, name: 'Junior Girls', code: 'JG', gender: 'FEMALE', minAge: 13, maxAge: 15, displayOrder: 4 },
      { tenantId, name: 'Senior Boys', code: 'SB', gender: 'MALE', minAge: 16, maxAge: 18, displayOrder: 5 },
      { tenantId, name: 'Senior Girls', code: 'SG', gender: 'FEMALE', minAge: 16, maxAge: 18, displayOrder: 6 },
      { tenantId, name: 'General / Open', code: 'GEN', gender: 'ALL', minAge: 10, maxAge: 99, displayOrder: 7 },
    ];

    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { tenantId, code: cat.code },
        cat,
        { upsert: true, new: true }
      );
    }
  }
}

export async function ensureInitialized() {
  await connectDB();
  await ensureSuperAdminInitialized();

  // If no tenants exist, create a starter tenant "demo" or "cherukavu"
  const tenantCount = await Tenant.countDocuments();
  if (tenantCount === 0) {
    const tenant = await Tenant.create({
      name: 'ചെറുകാവ് ഗ്രാമപഞ്ചായത്ത് കായികമേള 2026',
      slug: 'cherukavu',
      contactEmail: 'sports@kalolsavam.online',
      contactPhone: '+91 98765 43210',
      status: 'ACTIVE',
      settings: {
        firstPlacePoints: 5,
        secondPlacePoints: 3,
        thirdPlacePoints: 1,
        fourthPlacePoints: 0,
        themeColor: '#2563eb',
        meetDates: '2026 Nov 15 - 17',
        venue: 'Panchayath Stadium, Cherukavu',
      },
    });

    await MeetSettings.create({
      tenantId: tenant._id,
      name: tenant.name,
      subtitle: 'Sports & Athletic Championship',
      eventYear: '2026',
      themeColor: '#2563eb',
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      defaultPoints: { first: 5, second: 3, third: 1 },
    });

    const tenantAdminHash = await hashPassword('Admin@123');
    await User.create({
      tenantId: tenant._id,
      username: 'admin',
      name: 'Cherukavu Sports Admin',
      email: 'admin@kalolsavam.online',
      role: 'ADMIN',
      passwordHash: tenantAdminHash,
      isActive: true,
    });

    await seedTenantDefaultCategories(tenant._id as mongoose.Types.ObjectId);
  }
}
