import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  resendApiKeyEncrypted?: string;
  resendEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
    },
    resendApiKeyEncrypted: { type: String },
    resendEmail: { type: String, trim: true, lowercase: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
