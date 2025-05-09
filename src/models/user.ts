import mongoose from "mongoose";

export interface IUser {
  id: string;
  name: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User = mongoose.model<IUser>("User", userSchema);
