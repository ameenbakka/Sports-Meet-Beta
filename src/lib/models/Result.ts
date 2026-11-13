import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResultPlacement {
  participantId?: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  participantName: string;
  clubName: string;
  chestNumber?: string;
  scoreOrTime?: string;
  pointsAwarded: number;
}

export interface IResult extends Document {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  firstPlace?: IResultPlacement;
  secondPlace?: IResultPlacement;
  thirdPlace?: IResultPlacement;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResultPlacementSchema = new Schema<IResultPlacement>(
  {
    participantId: { type: Schema.Types.ObjectId, ref: 'Participant' },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    participantName: { type: String, required: true },
    clubName: { type: String, required: true },
    chestNumber: { type: String },
    scoreOrTime: { type: String },
    pointsAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const ResultSchema = new Schema<IResult>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true, index: true },
    firstPlace: { type: ResultPlacementSchema },
    secondPlace: { type: ResultPlacementSchema },
    thirdPlace: { type: ResultPlacementSchema },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'PUBLISHED', index: true },
    publishedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Result: Model<IResult> =
  mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
