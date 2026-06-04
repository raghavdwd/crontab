import mongoose, { Schema, Document } from "mongoose";

export interface IHeader {
  name: string;
  value: string;
  enabled: boolean;
}

export interface ICronJob extends Document {
  userId: mongoose.Types.ObjectId;
  name?: string;
  schedule: string;
  command: string;
  isActive: boolean;
  method?: string;
  headers?: IHeader[];
  body?: string;
  timeout?: number;
  expectedStatus?: number;
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
    method: { type: String, trim: true },
    headers: [{
      name: { type: String },
      value: { type: String },
      enabled: { type: Boolean },
    }],
    body: { type: String },
    timeout: { type: Number },
    expectedStatus: { type: Number },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICronJob>("CronJob", CronJobSchema);
