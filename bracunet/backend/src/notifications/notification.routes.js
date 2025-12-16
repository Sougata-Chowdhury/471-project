import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "./notification.service.js";

const router = Router();

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === "true";
    
    const result = await getUserNotifications(req.user._id, { page, limit, unreadOnly });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get("/unread-count", protect, async (req, res) => {
  try {
    const result = await getUnreadCount(req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ success: false, message: "Failed to get unread count" });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);
    res.status(200).json({ success: true, notification });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(404).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.put("/mark-all-read", protect, async (req, res) => {
  try {
    await markAllAsRead(req.user._id);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(404).json({ success: false, message: err.message });
  }
});

export default router;
