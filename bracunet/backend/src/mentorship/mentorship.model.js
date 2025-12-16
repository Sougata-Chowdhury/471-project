import mongoose from "mongoose";


const mentorshipSchema = new mongoose.Schema({
student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });


export default mongoose.model("Mentorship", mentorshipSchema);