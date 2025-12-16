import express from "express";
import { getMatchedMentors, sendMentorshipRequest, updateMentorshipStatus } from "./mentorship.controller.js";
import { protect as auth } from "../middleware/auth.js";




const router = express.Router();


router.get("/match", auth, getMatchedMentors);
router.post("/request", auth, sendMentorshipRequest);
router.patch("/:id", auth, updateMentorshipStatus);


export default router;