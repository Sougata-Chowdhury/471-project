const normalize = (arr = []) => arr.map((x) => (x || "").toString().trim().toLowerCase()).filter(Boolean);

export const calculateMatchScore = (student, mentor) => {
	const studentSkills = normalize(student?.skills);
	const studentInterests = normalize(student?.interests);
	const studentGoals = normalize(student?.mentorshipGoals);
	const mentorSkills = normalize(mentor?.skills);
	const mentorInterests = normalize(mentor?.interests);
	const mentorGoals = normalize(mentor?.mentorshipGoals);

	const sharedSkills = studentSkills.filter((skill) => mentorSkills.includes(skill));
	const sharedInterests = studentInterests.filter((i) => mentorInterests.includes(i));
	const sharedGoals = studentGoals.filter((g) => mentorGoals.includes(g));

	// Weighted scoring: skills 50%, goals 30%, interests 20%
	const skillRatio = sharedSkills.length / Math.max(studentSkills.length, 1);
	const goalRatio = sharedGoals.length / Math.max(studentGoals.length, 1);
	const interestRatio = sharedInterests.length / Math.max(studentInterests.length, 1);

	const score = Number(
		(skillRatio * 50 + goalRatio * 30 + interestRatio * 20).toFixed(1)
	);

	return { score, sharedSkills, sharedGoals, sharedInterests };
};