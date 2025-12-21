import express from "express";
import { 
  getActiveUsersStats, 
  getEventStats, 
  getDonationStats, 
  getEngagementStats 
} from "./analytics.controller.js";
// import { protect } from "../middleware/auth.js";

const router = express.Router();

// TODO: Enable authentication before production
// Protect all analytics routes - admin only
// router.use(protect);

router.get("/users", getActiveUsersStats);
router.get("/events", getEventStats);
router.get("/donations", getDonationStats);
router.get("/engagement", getEngagementStats);

export default router;
