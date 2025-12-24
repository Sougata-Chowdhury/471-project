import mongoose from "mongoose";

const mentorshipMessageSchema = new mongoose.Schema(
  {
    mentorship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentorship",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Optional call-event metadata for chat timeline
    isCallEvent: {
      type: Boolean,
      default: false,
    },
    callType: {
      type: String,
      enum: ["audio", "video"],
    },
    callStatus: {
      type: String,
      enum: ["missed", "ended", "started"],
    },
    callDurationSeconds: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MentorshipMessage", mentorshipMessageSchema);
