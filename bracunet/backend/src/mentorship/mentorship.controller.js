import Mentorship from "./mentorship.model.js";
import { findMentorsForStudent } from "./mentorship.service.js";
import { createNotification } from "../notifications/notification.service.js";
import MentorshipMessage from "./mentorshipMessage.model.js";
import pusher from "../config/pusher.js";

// Store active call timeouts so we can cancel them when the caller ends the call
const activeCallTimeouts = new Map();

// Helper to log a call event into the chat thread and emit it in real time
const logCallEvent = async ({
	mentorshipId,
	senderId,
	receiverId,
	message,
	callType,
	callStatus,
	callDurationSeconds,
}) => {
	const doc = await MentorshipMessage.create({
		mentorship: mentorshipId,
		sender: senderId,
		receiver: receiverId,
		message,
		isCallEvent: true,
		callType,
		callStatus,
		callDurationSeconds,
	});

	const populated = await doc.populate([
		{ path: "sender", select: "name email" },
		{ path: "receiver", select: "name email" },
	]);

	if (global.io) {
		global.io
			.to(`mentorship_${mentorshipId}`)
			.emit("mentorshipMessage", { ...populated.toObject(), mentorshipId });
	}
};


export const getMatchedMentors = async (req, res) => {
	const matches = await findMentorsForStudent(req.user.id);
	const response = matches.map(({ mentor, score, sharedSkills, sharedGoals, sharedInterests }) => ({
		...mentor.toObject(),
		score,
		sharedSkills,
		sharedGoals,
		sharedInterests,
	}));
	res.json(response);
};


export const sendMentorshipRequest = async (req, res) => {
	const { mentorId } = req.body;
	if (!mentorId) {
		return res.status(400).json({ message: "mentorId is required" });
	}
	if (mentorId === String(req.user.id)) {
		return res.status(400).json({ message: "You cannot request yourself" });
	}

	const existing = await Mentorship.findOne({
		student: req.user.id,
		mentor: mentorId,
	});

	if (existing && existing.status !== "rejected") {
		return res.status(400).json({ message: `Request already ${existing.status}` });
	}

	const request = existing
		? await Mentorship.findByIdAndUpdate(existing._id, { status: "pending" }, { new: true })
		: await Mentorship.create({ student: req.user.id, mentor: mentorId });

	const populated = await request.populate([
		{ path: "student", select: "name skills interests mentorshipGoals" },
		{ path: "mentor", select: "name role skills interests mentorshipGoals" },
	]);

	// Send notification to mentor
	await createNotification({
		userId: mentorId,
		type: "mentorship_request",
		title: "New Mentorship Request 📚",
		message: `${populated.student.name} wants to connect with you as a mentor.`,
		relatedId: request._id,
		relatedModel: "Mentorship",
		link: `/mentorship/chat`,
	});

	res.status(existing ? 200 : 201).json(populated);
};

// Start or fetch a conversation with a mentor without formal acceptance.
// Creates a Mentorship doc with status 'pending' if one doesn't exist.
export const startConversation = async (req, res) => {
	const { mentorId } = req.body;
	if (!mentorId) return res.status(400).json({ message: "mentorId is required" });
	if (mentorId === String(req.user.id)) {
		return res.status(400).json({ message: "You cannot message yourself" });
	}

	try {
		const meId = req.user.id;
		const otherId = mentorId;
		// Find existing mentorship regardless of orientation (student/mentor) to prevent duplicates
		let mentorship = await Mentorship.findOne({
			$or: [
				{ student: meId, mentor: otherId },
				{ student: otherId, mentor: meId },
			],
		});

		if (!mentorship) {
			// Create with correct orientation based on requester role when available
			const isRequesterMentor = String(req.user.role || "").toLowerCase() === "mentor";
			const payload = isRequesterMentor
				? { student: otherId, mentor: meId, status: "pending" }
				: { student: meId, mentor: otherId, status: "pending" };
			mentorship = await Mentorship.create(payload);

			const populated = await mentorship.populate([
				{ path: "student", select: "name" },
				{ path: "mentor", select: "name" },
			]);

			// Notify mentor of a new message request
			const mentorUserId = populated.mentor?._id || otherId;
			await createNotification({
				userId: mentorUserId,
				type: "message_request",
				title: "New Message Request",
				message: `${populated.student.name} sent you a message request.`,
				relatedId: mentorship._id,
				relatedModel: "Mentorship",
				link: "/mentorship/chat",
			});
		}

		res.json(mentorship);
	} catch (error) {
		res.status(500).json({ message: "Error starting conversation", error: error.message });
	}
};


export const getMyRequests = async (req, res) => {
	const requests = await Mentorship.find({ student: req.user.id })
		.sort({ createdAt: -1 })
		.populate({ path: "mentor", select: "name role skills interests mentorshipGoals" });
	res.json(requests);
};


export const getIncomingRequests = async (req, res) => {
	const requests = await Mentorship.find({ mentor: req.user.id })
		.sort({ createdAt: -1 })
		.populate({ path: "student", select: "name email skills interests mentorshipGoals" });
	res.json(requests);
};


export const updateMentorshipStatus = async (req, res) => {
	const { status } = req.body;
	const validStatuses = ["pending", "accepted", "rejected"];
	if (!validStatuses.includes(status)) {
		return res.status(400).json({ message: "Invalid status" });
	}

	const mentorship = await Mentorship.findById(req.params.id);
	if (!mentorship) {
		return res.status(404).json({ message: "Mentorship not found" });
	}

	if (String(mentorship.mentor) !== String(req.user.id)) {
		return res.status(403).json({ message: "Only the mentor can update this request" });
	}

	mentorship.status = status;
	await mentorship.save();

	const populated = await mentorship.populate([
		{ path: "student", select: "name skills interests mentorshipGoals" },
		{ path: "mentor", select: "name role skills interests mentorshipGoals" },
	]);

	res.json(populated);
};

// Notify a user about an incoming call (for missed/alert use cases)
export const notifyCall = async (req, res) => {
	const { receiverId, mentorshipId, callType, callUrl } = req.body;
	if (!receiverId || !mentorshipId) {
		return res.status(400).json({ message: "receiverId and mentorshipId are required" });
	}

	try {
		const incomingNotif = await createNotification({
			userId: receiverId,
			type: "message_request",
			title: callType === "audio" ? "Incoming Audio Call 📞" : "Incoming Video Call 📹",
			message: `${req.user.name} is calling you.`,
			relatedId: mentorshipId,
			relatedModel: "Mentorship",
			link: callUrl || "/mentorship/chat",
		});

		// Log call start in chat
		await logCallEvent({
			mentorshipId,
			senderId: req.user.id,
			receiverId,
			message: callType === "audio" ? "Outgoing audio call" : "Outgoing video call",
			callType,
			callStatus: "started",
			callDurationSeconds: 0,
		});

		// Send real-time call notification via Pusher
		const startedAt = Date.now();
		const callKey = `${mentorshipId}-${startedAt}`;
		try {
			await pusher.trigger(`user-${receiverId}`, "incoming-call", {
				callKey,
				mentorshipId,
				callType,
				callUrl,
				callerName: req.user.name,
				callerId: req.user.id,
				timestamp: startedAt,
			});
			console.log(`📡 Pusher event sent to user-${receiverId}`);
		} catch (pusherErr) {
			console.error("Pusher notification failed:", pusherErr.message);
		}

			// Store the timeout so it can be cancelled if the caller ends the call
			const timeoutId = setTimeout(async () => {
				try {
					await createNotification({
						userId: receiverId,
						type: "message_request",
						title: callType === "audio" ? "You missed an audio call 📞" : "You missed a video call 📹",
						message: `${req.user.name} called you. The call ended.`,
						relatedId: mentorshipId,
						relatedModel: "Mentorship",
						link: "/mentorship/chat",
					});

					// Log missed call in chat timeline
					await logCallEvent({
						mentorshipId,
						senderId: req.user.id,
						receiverId,
						message: callType === "audio" ? "Missed audio call" : "Missed video call",
						callType,
						callStatus: "missed",
						callDurationSeconds: 0,
					});
				} catch (err) {
					console.warn("Error creating missed call notification:", err.message);
				} finally {
					activeCallTimeouts.delete(callKey);
				}
			}, 120000); // 120 seconds (2 minutes)
			activeCallTimeouts.set(callKey, { timeoutId, startedAt, callType, callerId: req.user.id });

		res.json({ success: true, notificationId: incomingNotif._id, callKey });
	} catch (error) {
		res.status(500).json({ message: "Error creating call notification", error: error.message });
	}
};

// Called when the caller ends the call (instead of waiting for 30s)
export const endCallNotify = async (req, res) => {
	const { receiverId, mentorshipId, callKey, callType, callDurationSeconds } = req.body;
	if (!receiverId || !mentorshipId || !callKey) {
		return res.status(400).json({ message: "receiverId, mentorshipId, and callKey are required" });
	}

	try {
		const timeoutMeta = activeCallTimeouts.get(callKey);
		if (timeoutMeta) {
			clearTimeout(timeoutMeta.timeoutId);
			activeCallTimeouts.delete(callKey);
		}

		// Send a "call ended" notification instead
		await createNotification({
			userId: receiverId,
			type: "message_request",
			title: callType === "audio" ? "Audio call ended 📞" : "Video call ended 📹",
			message: `${req.user.name} ended the call.`,
			relatedId: mentorshipId,
			relatedModel: "Mentorship",
			link: "/mentorship/chat",
		});

		// Compute duration (prefer client-provided; fall back to server start time)
		let durationSeconds = Number(callDurationSeconds) || 0;
		if (!durationSeconds && timeoutMeta?.startedAt) {
			durationSeconds = Math.max(0, Math.floor((Date.now() - timeoutMeta.startedAt) / 1000));
		}

		await logCallEvent({
			mentorshipId,
			senderId: req.user.id,
			receiverId,
			message:
				durationSeconds > 0
					? `${callType === "audio" ? "Audio" : "Video"} call ended • ${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60)
							.toString()
							.padStart(2, "0")}`
					: `${callType === "audio" ? "Audio" : "Video"} call ended`,
			callType,
			callStatus: "ended",
			callDurationSeconds: durationSeconds,
		});

		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ message: "Error ending call notification", error: error.message });
	}
};

// Called when receiver answers the call
export const answerCall = async (req, res) => {
	const { mentorshipId, callKey, callType } = req.body;
	if (!mentorshipId || !callKey) {
		return res.status(400).json({ message: "mentorshipId and callKey are required" });
	}

	try {
		const timeoutMeta = activeCallTimeouts.get(callKey);
		if (timeoutMeta) {
			clearTimeout(timeoutMeta.timeoutId);
			activeCallTimeouts.delete(callKey);
			console.log(`✅ Call answered, timeout cleared for ${callKey}`);

			// Notify caller that call was answered via Pusher
			try {
				await pusher.trigger(`user-${timeoutMeta.callerId}`, "call-answered", {
					callKey,
					mentorshipId,
					answeredBy: req.user.name,
					answeredById: req.user.id,
				});
				console.log(`📡 Call answered event sent to user-${timeoutMeta.callerId}`);
			} catch (pusherErr) {
				console.error("Pusher answer notification failed:", pusherErr.message);
			}
		}

		// Log call answered in chat
		await logCallEvent({
			mentorshipId,
			senderId: req.user.id,
			receiverId: timeoutMeta?.callerId,
			message: callType === "audio" ? "Answered audio call" : "Answered video call",
			callType,
			callStatus: "answered",
			callDurationSeconds: 0,
		});

		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ message: "Error answering call", error: error.message });
	}
};

// Called when receiver rejects the call
export const rejectCall = async (req, res) => {
	const { mentorshipId, callKey, callType } = req.body;
	if (!mentorshipId || !callKey) {
		return res.status(400).json({ message: "mentorshipId and callKey are required" });
	}

	try {
		const timeoutMeta = activeCallTimeouts.get(callKey);
		if (timeoutMeta) {
			clearTimeout(timeoutMeta.timeoutId);
			activeCallTimeouts.delete(callKey);
			console.log(`❌ Call rejected, timeout cleared for ${callKey}`);

			// Notify caller that call was rejected
			await createNotification({
				userId: timeoutMeta.callerId,
				type: "message_request",
				title: callType === "audio" ? "Audio call declined 📞" : "Video call declined 📹",
				message: `${req.user.name} declined your call.`,
				relatedId: mentorshipId,
				relatedModel: "Mentorship",
				link: "/mentorship/chat",
			});

			// Send real-time rejection via Pusher
			try {
				await pusher.trigger(`user-${timeoutMeta.callerId}`, "call-rejected", {
					callKey,
					mentorshipId,
					rejectedBy: req.user.name,
					rejectedById: req.user.id,
				});
				console.log(`📡 Call rejected event sent to user-${timeoutMeta.callerId}`);
			} catch (pusherErr) {
				console.error("Pusher rejection notification failed:", pusherErr.message);
			}
		}

		// Log call rejected in chat
		await logCallEvent({
			mentorshipId,
			senderId: req.user.id,
			receiverId: timeoutMeta?.callerId,
			message: callType === "audio" ? "Declined audio call" : "Declined video call",
			callType,
			callStatus: "rejected",
			callDurationSeconds: 0,
		});

		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ message: "Error rejecting call", error: error.message });
	}
};