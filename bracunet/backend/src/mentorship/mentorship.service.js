import { User } from "../users/user.model.js";
import { calculateMatchScore } from "./mentorship.matching.js";
import MentorRequest from "./mentorRequest.model.js";


// Find best mentors for a student:
// Alumni and faculty are always eligible.
// Students are only eligible if they have an approved MentorRequest.
export const findMentorsForStudent = async (studentId) => {
	const student = await User.findById(studentId);
	if (!student) return [];

	// Get all alumni/faculty
	const alumniAndFaculty = await User.find({
		role: { $in: ["alumni", "faculty"] },
		_id: { $ne: studentId },
	});

	// Get approved student mentors
	const approvedRequests = await MentorRequest.find({
		status: "approved",
	}).select("user");

	const approvedStudentIds = approvedRequests.map((req) => req.user.toString());

	// Get approved student users
	const approvedStudents = await User.find({
		_id: { $in: approvedStudentIds },
		role: "student",
	});

	// Combine all eligible mentors
	const mentors = [...alumniAndFaculty, ...approvedStudents];

	const scoredMentors = mentors.map((mentor) => {
		const match = calculateMatchScore(student, mentor);
		return { mentor, ...match };
	});

	return scoredMentors.sort((a, b) => b.score - a.score);
};