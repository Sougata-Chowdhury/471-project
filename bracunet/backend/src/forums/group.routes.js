// routes/group.routes.js
import express from "express";
import { protect, authorize, isAdmin } from "../middleware/auth.js";
import {
  getAllGroups,
  createGroup,
  joinGroup,
  approveJoinRequest,
  createMeeting,
} from "./group.controller.js";

const router = express.Router();

router.get("/groups", protect, getAllGroups); // all groups
router.post("/groups", protect, authorize("admin", "faculty", "alumni"), createGroup); 
router.post("/groups/:id/join", protect, joinGroup); // user join request
router.post("/groups/:groupId/approve/:userId", protect, authorize("admin"), approveJoinRequest); 
router.post('/groups/:id/meetings', protect, createMeeting);

export default router;
