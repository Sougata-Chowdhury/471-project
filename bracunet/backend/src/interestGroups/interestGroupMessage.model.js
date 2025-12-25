import mongoose from 'mongoose';

const interestGroupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterestGroup',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      // Message required only when there is no image
      required: function () {
        return !this.imageUrl;
      },
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isCallEvent: {
      type: Boolean,
      default: false,
    },
    callType: {
      type: String,
      enum: ['audio', 'video', null],
      default: null,
    },
    callStatus: {
      type: String,
      enum: ['started', 'ended', 'missed', null],
      default: null,
    },
    callDurationSeconds: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('InterestGroupMessage', interestGroupMessageSchema);
