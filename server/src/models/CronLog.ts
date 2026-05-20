import mongoose, { Schema, Document } from "mongoose";

export interface ICronLog extends Document {
  jobId: mongoose.Types.ObjectId;
  jobName: string;
  command: string;
  triggerTime: Date;
  endTime?: Date;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  status: "running" | "success" | "failure";
}

const CronLogSchema: Schema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "CronJob", required: true },
    jobName: { type: String },
    command: { type: String, required: true },
    triggerTime: { type: Date, required: true },
    endTime: { type: Date },
    exitCode: { type: Number },
    stdout: { type: String },
    stderr: { type: String },
    status: { type: String, enum: ["running", "success", "failure"], default: "running" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICronLog>("CronLog", CronLogSchema);
