import mongoose, { models } from "mongoose";
import { Schema } from "mongoose";

export interface IAudienceMember {
  _id: string;
  audienceId: mongoose.Types.ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const audienceMemberSchema = new Schema<IAudienceMember>(
  {
    audienceId: {
      type: Schema.Types.ObjectId,
      ref: "Audience",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for audienceId and email to ensure uniqueness
audienceMemberSchema.index({ audienceId: 1, email: 1 }, { unique: true });

if (models.AudienceMember) {
  delete models.AudienceMember;
}

export const AudienceMember =
  mongoose.model<IAudienceMember>("AudienceMember", audienceMemberSchema);
