import { connectDB } from './db';
import { MeetSettings } from './models/MeetSettings';
import { User } from './models/User';
import { Category } from './models/Category';
import { hashPassword } from './auth';

export async function ensureInitialized() {
  await connectDB();

  // 1. Ensure MeetSettings exist
  let settings = await MeetSettings.findOne();
  if (!settings) {
    settings = await MeetSettings.create({
      name: 'ചെറുകാവ് ഗ്രാമപഞ്ചായത്ത് കേരളോത്സവം 2024',
      subtitle: 'Sports & Athletic Championship',
      eventYear: '2024-25',
      themeColor: '#2563eb',
      defaultPoints: { first: 5, second: 3, third: 1 },
    });
  }

  // 2. Ensure Admin user exists with role ADMIN and Admin@123 password
  const existingAdmin = await User.findOne({ username: 'admin' });
  if (!existingAdmin) {
    const passwordHash = await hashPassword('Admin@123');
    await User.create({
      username: 'admin',
      name: 'Sports Council Administrator',
      email: 'admin@sportsmeet.online',
      role: 'ADMIN',
      passwordHash,
      isActive: true,
    });
  } else {
    // If admin already exists from previous multi-tenant schema, normalize to ADMIN
    if (existingAdmin.role !== 'ADMIN') {
      existingAdmin.role = 'ADMIN';
      await existingAdmin.save();
    }
  }

  // 3. Ensure Default Categories exist
  const count = await Category.countDocuments();
  if (count === 0) {
    const defaultCategories = [
      { name: 'Sub-Junior Boys', code: 'SJB', gender: 'MALE', minAge: 10, maxAge: 12, displayOrder: 1 },
      { name: 'Sub-Junior Girls', code: 'SJG', gender: 'FEMALE', minAge: 10, maxAge: 12, displayOrder: 2 },
      { name: 'Junior Boys', code: 'JB', gender: 'MALE', minAge: 13, maxAge: 15, displayOrder: 3 },
      { name: 'Junior Girls', code: 'JG', gender: 'FEMALE', minAge: 13, maxAge: 15, displayOrder: 4 },
      { name: 'Senior Boys', code: 'SB', gender: 'MALE', minAge: 16, maxAge: 18, displayOrder: 5 },
      { name: 'Senior Girls', code: 'SG', gender: 'FEMALE', minAge: 16, maxAge: 18, displayOrder: 6 },
      { name: 'General / Open', code: 'GEN', gender: 'ALL', minAge: 10, maxAge: 99, displayOrder: 7 },
    ];

    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate({ code: cat.code }, cat, { upsert: true, new: true });
    }
  }

  return settings;
}
