import mongoose from "mongoose";
const { Schema } = mongoose;

const errorSchema = new Schema(
  {
    code: Number,
    message: String,
  },
  { timestamps: true }
);

export const Error = mongoose.model("Error", errorSchema);
