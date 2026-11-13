import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'ADMIN' | 'CLUB_MANAGER';

export interface IUser extends Document {
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
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'CLUB_MANAGER'],
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

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
