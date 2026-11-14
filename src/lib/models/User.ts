import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'ADMIN' | 'CLUB_MANAGER' | 'TENANT_ADMIN' | 'SUPER_ADMIN';

export interface IUser extends Document {
  tenantId?: mongoose.Types.ObjectId;
  username: string;
  passwordHash: string;
  role: UserRole;
  clubId?: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    username: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'CLUB_MANAGER', 'TENANT_ADMIN', 'SUPER_ADMIN'],
      default: 'CLUB_MANAGER',
      required: true,
    },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club' },
    name: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index for unique usernames per tenant
UserSchema.index({ tenantId: 1, username: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
