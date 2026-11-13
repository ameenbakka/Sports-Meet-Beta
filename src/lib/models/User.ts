import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'CLUB_MANAGER';

export interface IUser extends Document {
  tenantId: mongoose.Types.ObjectId;
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
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    username: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLUB_MANAGER'],
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

// Compound index to ensure uniqueness of username per tenant
UserSchema.index({ tenantId: 1, username: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
