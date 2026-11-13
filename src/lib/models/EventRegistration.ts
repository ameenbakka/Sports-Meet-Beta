import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'Participant', required: true, index: true },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ eventId: 1, participantId: 1 }, { unique: true });

export const EventRegistration: Model<IEventRegistration> =
  mongoose.models.EventRegistration ||
  mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);
