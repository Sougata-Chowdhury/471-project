import { User } from "../users/user.model.js";
import { calculateMatchScore } from "./mentorship.matching.js";


export const findMentorsForStudent = async (studentId) => {
const student = await User.findById(studentId);
const mentors = await User.find({ role: "mentor" });


const scoredMentors = mentors.map(mentor => ({
mentor,
score: calculateMatchScore(student, mentor)
}));


return scoredMentors.sort((a, b) => b.score - a.score);
};