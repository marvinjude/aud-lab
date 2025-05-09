import mongoose from "mongoose";
import { model, models } from "mongoose";

export interface IAudience {
  _id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  externalId?: string;
  userId?: string;
  lastSyncedAt?: Date;
}

const audienceSchema = new mongoose.Schema<IAudience>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    memberCount: {
      type: Number,
      required: true,
      default: 0,
    },
    externalId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: String,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

if (models.Audience) {
  delete models.Audience;
}

export const Audience = model<IAudience>("Audience", audienceSchema);
