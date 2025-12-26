import express from "express";
import {
	getMatchedMentors,
	sendMentorshipRequest,
	updateMentorshipStatus,
	getMyRequests,
	getIncomingRequests,
    startConversation,
} from "./mentorship.controller.js";
import {
	sendMessage,
	getConversation,
	markAsRead,
	getPendingRequests,
} from "./mentorshipMessage.controller.js";
import {
	submitMentorRequest,
	approveMentorRequest,
	rejectMentorRequest,
	getPendingMentorRequests,
	getMentorRequestStatus,
} from "./mentorRequest.controller.js";
import {
	createAnnouncement,
	getAnnouncements,
	deleteAnnouncement,
} from "./announcement.controller.js";
import { notifyCall, endCallNotify, answerCall, rejectCall } from "./mentorship.controller.js";
import { protect as auth, authorize } from "../middleware/auth.js";


const router = express.Router();


router.get("/match", auth, getMatchedMentors); // legacy alias
router.get("/mentors", auth, getMatchedMentors);
router.get("/my-requests", auth, getMyRequests);
router.get("/incoming", auth, getIncomingRequests);
router.post("/request", auth, sendMentorshipRequest);
router.post("/conversation/start", auth, startConversation);
router.patch("/:id", auth, updateMentorshipStatus);

// Messaging routes
router.post("/message/send", auth, sendMessage);
router.get("/message/:mentorshipId", auth, getConversation);
router.patch("/message/:mentorshipId/read", auth, markAsRead);
router.get("/pending/requests", auth, getPendingRequests);

// Mentor request routes
router.post("/mentor-request/submit", auth, submitMentorRequest);
router.get("/mentor-request/status", auth, getMentorRequestStatus);
router.post("/mentor-request/:requestId/approve", auth, authorize("admin"), approveMentorRequest);
router.post("/mentor-request/:requestId/reject", auth, authorize("admin"), rejectMentorRequest);
router.get("/mentor-request/admin/pending", auth, authorize("admin"), getPendingMentorRequests);

// Call notification route
router.post("/call/notify", auth, notifyCall);
router.post("/call/end", auth, endCallNotify);
router.post("/call/answer", auth, answerCall);
router.post("/call/reject", auth, rejectCall);

// Announcement routes
router.post("/announcement/create", auth, createAnnouncement);
router.get("/announcement/:mentorshipId", auth, getAnnouncements);
router.delete("/announcement/:announcementId", auth, deleteAnnouncement);

// Video call routes (Jitsi - free, no backend token needed)
// Legacy Agora routes removed - using Jitsi instead

export default router;