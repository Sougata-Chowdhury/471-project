import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: String, default: null }, // optional image URL / cloudinary URL
    category: {
      type: String,
      enum: ["announcement", "achievement", "event"],
      default: "announcement",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const News = mongoose.model("News", newsSchema);
export default News;
