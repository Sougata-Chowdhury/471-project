// import mongoose from "mongoose";

// const groupSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   topic: { type: String, required: true },
//   description: { type: String },
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   createdAt: { type: Date, default: Date.now },
// });

// export const Group = mongoose.model("Group", groupSchema);


import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  image: { type: String },
  meetings: [
    {
      url: { type: String },
      dailyRoomName: { type: String },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    }
  ]
}, { timestamps: true });

export default mongoose.model("Group", groupSchema);
