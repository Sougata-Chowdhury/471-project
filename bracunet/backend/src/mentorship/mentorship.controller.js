import Mentorship from "./mentorship.model.js";
import { findMentorsForStudent } from "./mentorship.service.js";
import { createNotification } from "../notifications/notification.service.js";

// Store active call timeouts so we can cancel them when the caller ends the call
const activeCallTimeouts = new Map();


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
		let mentorship = await Mentorship.findOne({ student: req.user.id, mentor: mentorId });

		if (!mentorship) {
			mentorship = await Mentorship.create({ student: req.user.id, mentor: mentorId, status: "pending" });

			const populated = await mentorship.populate([
				{ path: "student", select: "name" },
				{ path: "mentor", select: "name" },
			]);

			// Notify mentor of a new message request
			await createNotification({
				userId: mentorId,
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

	// Store the timeout so it can be cancelled if the caller ends the call
		const callKey = `${mentorshipId}-${Date.now()}`;
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
			} catch (err) {
				console.warn("Error creating missed call notification:", err.message);
			} finally {
				activeCallTimeouts.delete(callKey);
			}
		}, 30000); // 30 seconds
		activeCallTimeouts.set(callKey, timeoutId);

		res.json({ success: true, notificationId: incomingNotif._id, callKey });
	} catch (error) {
		res.status(500).json({ message: "Error creating call notification", error: error.message });
	}
};

// Called when the caller ends the call (instead of waiting for 30s)
export const endCallNotify = async (req, res) => {
	const { receiverId, mentorshipId, callKey, callType } = req.body;
	if (!receiverId || !mentorshipId || !callKey) {
		return res.status(400).json({ message: "receiverId, mentorshipId, and callKey are required" });
	}

	try {
		// Cancel the 30-second timeout for missed call notification
		if (activeCallTimeouts.has(callKey)) {
			clearTimeout(activeCallTimeouts.get(callKey));
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

		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ message: "Error ending call notification", error: error.message });
	}
};