import { RecommendationRequest } from "./recommendation.model.js";
import { User } from "../users/user.model.js";
import { createNotification } from "../notifications/notification.service.js";
import pusher from "../config/pusher.js";

export const recommendationService = {
  // Get all faculty members
  async getFacultyMembers() {
    const faculty = await User.find({ role: "faculty", isVerified: true })
      .select("name email department")
      .sort({ name: 1 });
    return faculty;
  },

  // Create a recommendation request
  async createRequest(data, userId) {
    const request = new RecommendationRequest({
      ...data,
      requestedBy: userId,
    });
    await request.save();
    await request.populate([
      { path: "requestedBy", select: "name email" },
      { path: "requestedTo", select: "name email" },
    ]);
    return request;
  },

  // Get requests made by a user (student/alumni)
  async getMyRequests(userId) {
    const requests = await RecommendationRequest.find({ requestedBy: userId })
      .populate("requestedTo", "name email")
      .sort({ createdAt: -1 });
    return requests;
  },

  // Get requests received by a faculty
  async getReceivedRequests(facultyId) {
    const requests = await RecommendationRequest.find({ requestedTo: facultyId })
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });
    return requests;
  },

  // Update request status (faculty only)
  async updateRequestStatus(requestId, status, facultyId) {
    const request = await RecommendationRequest.findById(requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.requestedTo.toString() !== facultyId.toString()) {
      throw new Error("Not authorized to update this request");
    }

    request.status = status;
    await request.save();
    await request.populate([
      { path: "requestedBy", select: "name email" },
      { path: "requestedTo", select: "name email" },
    ]);

    // Send notification to the student about status change
    try {
      await createNotification(
        request.requestedBy._id,
        "recommendation",
        `Recommendation Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your recommendation request to ${request.requestedTo.name} has been ${status}.`,
        request._id,
        "RecommendationRequest",
        "/career",
        status === "accepted" ? "high" : "normal"
      );
    } catch (err) {
      console.error("Failed to send notification:", err);
    }

    return request;
  },

  // Upload recommendation letter (faculty only)
  async uploadLetter(requestId, letterUrl, letterFileName, facultyId) {
    const request = await RecommendationRequest.findById(requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.requestedTo.toString() !== facultyId.toString()) {
      throw new Error("Not authorized to upload letter for this request");
    }

    if (request.status !== "accepted") {
      throw new Error("Can only upload letter for accepted requests");
    }

    request.letterUrl = letterUrl;
    request.letterFileName = letterFileName;
    request.letterUploadedAt = new Date();
    await request.save();
    await request.populate([
      { path: "requestedBy", select: "name email" },
      { path: "requestedTo", select: "name email" },
    ]);

    // Send real-time notification via Pusher
    try {
      await pusher.trigger(`user-${request.requestedBy._id}`, "recommendation-letter-uploaded", {
        requestId: request._id,
        letterUrl: request.letterUrl,
        letterFileName: request.letterFileName,
        facultyName: request.requestedTo.name,
        uploadedAt: request.letterUploadedAt,
      });
      console.log("✅ Pusher event sent for letter upload");
    } catch (err) {
      console.error("Failed to send Pusher notification:", err);
    }

    // Also create a persistent notification
    try {
      await createNotification(
        request.requestedBy._id,
        "recommendation",
        "Recommendation Letter Uploaded",
        `${request.requestedTo.name} has uploaded your recommendation letter. You can now download it.`,
        request._id,
        "RecommendationRequest",
        "/career",
        "high"
      );
    } catch (err) {
      console.error("Failed to send notification:", err);
    }

    return request;
  },

  // Delete recommendation request
  async deleteRequest(requestId, userId, userRole) {
    const request = await RecommendationRequest.findById(requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    // Students can delete their own requests, faculty can delete requests made to them
    const canDelete = 
      (userRole === "student" || userRole === "alumni") && request.requestedBy.toString() === userId.toString() ||
      userRole === "faculty" && request.requestedTo.toString() === userId.toString();

    if (!canDelete) {
      throw new Error("Not authorized to delete this request");
    }

    await RecommendationRequest.findByIdAndDelete(requestId);
    return { message: "Request deleted successfully" };
  },
};
