import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    eventType: {
      type: String,
      enum: ["meetup", "webinar", "reunion", "workshop", "seminar", "other"],
      default: "meetup",
    },
    eventDate: { 
      type: Date, 
      required: true 
    },
    startTime: { 
      type: String, 
      required: true 
    },
    endTime: { 
      type: String, 
      required: true 
    },
    location: { 
      type: String, 
      required: function() {
        return !this.isVirtual;
      }
    },
    isVirtual: { 
      type: Boolean, 
      default: false 
    },
    meetingLink: { 
      type: String, 
      required: function() {
        return this.isVirtual;
      }
    },
    capacity: { 
      type: Number, 
      default: null 
    },
    image: { 
      type: String, 
      default: null 
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
    rsvps: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["going", "maybe", "not-going"],
          default: "going",
        },
        rsvpDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attendance: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        checkInTime: {
          type: Date,
          default: Date.now,
        },
        checkOutTime: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

// Virtual for RSVP count
eventSchema.virtual("rsvpCount").get(function () {
  return this.rsvps.filter((r) => r.status === "going").length;
});

// Virtual for attendance count
eventSchema.virtual("attendanceCount").get(function () {
  return this.attendance.length;
});

// Ensure virtuals are included in JSON
eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;
