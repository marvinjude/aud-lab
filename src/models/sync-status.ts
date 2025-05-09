import { model, models } from "mongoose";
import mongoose from "mongoose";

export enum SyncStatusType {
  INPROGRESS = "INPROGRESS",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export interface ISyncStatus {
  id: string;
  audienceId: string;
  status: SyncStatusType;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

const syncStatusSchema = new mongoose.Schema<ISyncStatus>(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(SyncStatusType),
    },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

if (models && models.SyncStatus) {
  delete models.SyncStatus;
}

export const SyncStatus = model<ISyncStatus>("SyncStatus", syncStatusSchema);
