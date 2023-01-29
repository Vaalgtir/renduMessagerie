import mongoose from "mongoose";
const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    owners: [Number],
    messages: [
      {
        owner: Number,
        message: String,
        reports: [
          {
            justification: String,
            from: Number,
            treated: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
