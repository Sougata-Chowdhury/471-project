// routes/group.routes.js
import express from "express";
import { protect, authorize, isAdmin, optionalAuth } from "../middleware/auth.js";
import cloudinaryUpload from "../middleware/upload.js";
import {
  getAllGroups,
  createGroup,
  joinGroup,
  approveJoinRequest,
  createMeeting,
  createMeetingToken,
  getJoinRequests,
  rejectJoinRequest,
  getGroupDetails,
} from "./group.controller.js";

const router = express.Router();

router.get("/groups", optionalAuth, getAllGroups); // all groups (public, optional auth)
// Allow optional image upload (field name: 'image') when creating a group
router.post("/groups", protect, authorize("admin", "faculty", "alumni"), (req, res, next) => {
  cloudinaryUpload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'Image upload failed' });
    }
    next();
  });
}, createGroup);
router.post("/groups/:id/join", protect, joinGroup); // user join request
router.post("/groups/:groupId/approve/:userId", protect, authorize("admin"), approveJoinRequest); 
// Admin endpoints for requests
router.get('/groups/:id/requests', protect, authorize('admin'), getJoinRequests);
router.post('/groups/:groupId/reject/:userId', protect, authorize('admin'), rejectJoinRequest);
router.post('/groups/:id/meetings', protect, createMeeting);
// Create meeting token for existing daily room
router.post('/groups/:id/meetings/:roomName/token', protect, createMeetingToken);
// Debug: get group details (members + requests)
router.get('/groups/:id/details', protect, getGroupDetails);

export default router;
