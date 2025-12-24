import mongoose from "mongoose";

const recommendationRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    letterUrl: {
      type: String,
      trim: true,
    },
    letterFileName: {
      type: String,
      trim: true,
    },
    letterUploadedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const RecommendationRequest = mongoose.model(
  "RecommendationRequest",
  recommendationRequestSchema
);
