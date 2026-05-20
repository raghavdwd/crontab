import mongoose, { Schema, Document } from "mongoose";

export interface ICronJob extends Document {
  userId: mongoose.Types.ObjectId;
  name?: string;
  schedule: string;
  command: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CronJobSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true },
    schedule: { type: String, required: true, trim: true },
    command: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICronJob>("CronJob", CronJobSchema);
