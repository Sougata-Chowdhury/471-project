import Mentorship from "./mentorship.model.js";
import { findMentorsForStudent } from "./mentorship.service.js";


export const getMatchedMentors = async (req, res) => {
const matches = await findMentorsForStudent(req.user.id);
res.json(matches);
};


export const sendMentorshipRequest = async (req, res) => {
const { mentorId } = req.body;


const request = await Mentorship.create({
student: req.user.id,
mentor: mentorId
});


res.status(201).json(request);
};


export const updateMentorshipStatus = async (req, res) => {
const { status } = req.body;


const mentorship = await Mentorship.findByIdAndUpdate(
req.params.id,
{ status },
{ new: true }
);


res.json(mentorship);
};