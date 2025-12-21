import MentorRequest from "./mentorRequest.model.js";
import { User } from "../users/user.model.js";
import { createNotification } from "../notifications/notification.service.js";

export const submitMentorRequest = async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length < 10) {
    return res.status(400).json({ message: "Please provide a reason (min 10 chars)" });
  }

  try {
    const existing = await MentorRequest.findOne({
      user: req.user.id,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "You already have a pending mentor request" });
    }

    const request = await MentorRequest.create({
      user: req.user.id,
      reason,
    });

    // Notify admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        type: "mentor_request",
        title: "New Mentor Request",
        message: `${req.user.name} wants to become a mentor.`,
        relatedId: request._id,
        relatedModel: "MentorRequest",
        link: `/admin/mentor-requests`,
      });
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error submitting request", error: error.message });
  }
};

export const approveMentorRequest = async (req, res) => {
  const { requestId, adminNotes } = req.body;

  try {
    const request = await MentorRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "approved";
    request.adminNotes = adminNotes || "";
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    // Update user role to mentor
    await User.findByIdAndUpdate(request.user, {
      $addToSet: { mentorRoles: { type: "student_mentor", approvedAt: new Date() } },
    });

    // Notify user
    const user = await User.findById(request.user);
    await createNotification({
      userId: request.user,
      type: "mentor_approved",
      title: "Mentor Request Approved!",
      message: `Your request to become a mentor has been approved. You can now help students!`,
      relatedId: request._id,
      relatedModel: "MentorRequest",
      link: `/mentorship`,
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Error approving request", error: error.message });
  }
};

export const rejectMentorRequest = async (req, res) => {
  const { requestId, adminNotes } = req.body;

  try {
    const request = await MentorRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    request.adminNotes = adminNotes || "";
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    // Notify user
    const user = await User.findById(request.user);
    await createNotification({
      userId: request.user,
      type: "mentor_rejected",
      title: "Mentor Request Rejected",
      message: `Your request to become a mentor was not approved. ${adminNotes || ""}`,
      relatedId: request._id,
      relatedModel: "MentorRequest",
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Error rejecting request", error: error.message });
  }
};

export const getPendingMentorRequests = async (req, res) => {
  try {
    const requests = await MentorRequest.find({ status: "pending" })
      .populate("user", "name email studentId department")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

export const getMentorRequestStatus = async (req, res) => {
  try {
    const request = await MentorRequest.findOne({ user: req.user.id });
    res.json(request || { status: "none" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching status", error: error.message });
  }
};
