import mongoose, { Document } from "mongoose";

const aiSchema = new mongoose.Schema<IAi>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cron_description: { type: String, required: true },
        cron_expression: { type: String, required: true },
    },
    { timestamps: true }
);

interface IAi extends Document {
    userId: mongoose.Types.ObjectId;
    cron_expression: string;
    cron_description: string;
}

export default mongoose.model<IAi>("ai", aiSchema);