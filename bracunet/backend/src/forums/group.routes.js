// routes/group.routes.js
import express from "express";
import { protect, authorize, isAdmin } from "../middlewares/auth.js";
import {
  getGroups,
  createGroup,
  requestToJoinGroup,
  getJoinRequests,
  approveJoinRequest,
} from "../controllers/group.controller.js";

const router = express.Router();

router.get("/groups", protect, getGroups); // all groups
router.post("/groups", protect, authorize("admin", "faculty", "alumni"), createGroup); 
router.post("/groups/:id/join", protect, requestToJoinGroup); // user join request
router.get("/groups/:id/requests", protect, authorize("admin"), getJoinRequests); // admin view requests
router.post("/groups/:groupId/requests/:requestId/approve", protect, authorize("admin"), approveJoinRequest); 

export default router;
