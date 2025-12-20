import { RecommendationRequest } from "./recommendation.model.js";
import { User } from "../users/user.model.js";

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

    return request;
  },
};
