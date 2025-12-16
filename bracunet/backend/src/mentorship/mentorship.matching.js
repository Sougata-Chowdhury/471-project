export const calculateMatchScore = (student, mentor) => {
let score = 0;


const skillMatch = student.skills.filter(skill => mentor.skills.includes(skill));
score += skillMatch.length * 2;


const interestMatch = student.interests.filter(i => mentor.interests.includes(i));
score += interestMatch.length;


if (mentor.goals && student.goals && mentor.goals.includes(student.goals)) {
score += 2;
}


return score;
};