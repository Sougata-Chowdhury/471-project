import mongoose from "mongoose";

const careerOpportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["job", "internship"],
      default: "job"
    },
    description: {
      type: String,
      default: ""
    },
    externalLink: {
      type: String,
      default: ""
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const CareerOpportunity = mongoose.model("CareerOpportunity", careerOpportunitySchema);
