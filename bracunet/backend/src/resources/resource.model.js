// import mongoose from "mongoose";

// const resourceSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String },
//   fileUrl: { type: String, required: true },
//   uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   approved: { type: Boolean, default: false },
//   type: { type: String, required: true },
//   status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

// }, { timestamps: true });


// export default mongoose.model("Resource", resourceSchema);




import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true }, // Career Advice, Research, Entrepreneurship
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
