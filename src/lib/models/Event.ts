import mongoose, { Schema, Document, Model } from 'mongoose';

export type EventType = 'INDIVIDUAL' | 'GROUP' | 'TEAM';
export type EventGender = 'MALE' | 'FEMALE' | 'MIXED';
export type EventStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED';

export interface IEvent extends Document {
  categoryId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  type: EventType;
  gender: EventGender;
  maxParticipantsPerClub: number;
  pointsScheme: {
    first: number;
    second: number;
    third: number;
  };
  status: EventStatus;
  scheduleTime?: Date;
  venue?: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, uppercase: true, trim: true },
    type: { type: String, enum: ['INDIVIDUAL', 'GROUP', 'TEAM'], default: 'INDIVIDUAL' },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'MIXED'], default: 'MIXED' },
    maxParticipantsPerClub: { type: Number, default: 2 },
    pointsScheme: {
      first: { type: Number, default: 5 },
      second: { type: Number, default: 3 },
      third: { type: Number, default: 1 },
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ONGOING', 'COMPLETED'],
      default: 'SCHEDULED',
      index: true,
    },
    scheduleTime: { type: Date },
    venue: { type: String, trim: true },
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EventModel: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
