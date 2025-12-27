import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  cancelRsvp,
  checkInAttendance,
  checkOutAttendance,
  getMyEvents,
  getMyRsvps,
  getEventAnalytics,
} from "./event.service.js";

const router = Router();

/**
 * GET /api/events
 * Get all events (public)
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "published";
    const eventType = req.query.eventType || "all";
    const upcoming = req.query.upcoming === "true";

    const result = await getAllEvents({ page, limit, status, eventType, upcoming });
    res.status(200).json(result);
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ success: false, message: "Cannot fetch events" });
  }
});

/**
 * GET /api/events/my-events
 * Get events created by logged-in user
 */
router.get("/my-events", protect, async (req, res) => {
  try {
    const events = await getMyEvents(req.user._id);
    res.status(200).json({ success: true, events });
  } catch (err) {
    console.error("Get my events error:", err);
    res.status(500).json({ success: false, message: "Cannot fetch your events" });
  }
});

/**
 * GET /api/events/my-rsvps
 * Get events user RSVP'd to
 */
router.get("/my-rsvps", protect, async (req, res) => {
  try {
    console.log("[my-rsvps route] User:", req.user._id, req.user.name);
    const events = await getMyRsvps(req.user._id);
    console.log("[my-rsvps route] Returning", events.length, "events");
    res.status(200).json({ success: true, events });
  } catch (err) {
    console.error("Get my RSVPs error:", err);
    res.status(500).json({ success: false, message: "Cannot fetch your RSVPs" });
  }
});

/**
 * GET /api/events/:id
 * Get single event by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    res.status(200).json({ success: true, event });
  } catch (err) {
    console.error("Get event by ID error:", err);
    res.status(404).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/events/:id/analytics
 * Get event analytics (organizer or admin only)
 */
router.get("/:id/analytics", protect, async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    
    // Check if user is organizer or admin
    const isOrganizer = event.organizer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    
    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    const analytics = await getEventAnalytics(req.params.id);
    res.status(200).json({ success: true, analytics });
  } catch (err) {
    console.error("Get event analytics error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/events
 * Create new event (authenticated users)
 */
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
    };
    
    // Add image URL if uploaded
    if (req.file) {
      eventData.image = req.file.path;
    }
    
    const event = await createEvent(eventData);
    res.status(201).json({ success: true, event });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/events/:id
 * Update event (organizer only)
 */
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Add new image if uploaded
    if (req.file) {
      updates.image = req.file.path;
    }
    
    const event = await updateEvent(req.params.id, req.user._id, updates);
    res.status(200).json({ success: true, event });
  } catch (err) {
    console.error("Update event error:", err);
    res.status(403).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/events/:id
 * Delete event (organizer or admin)
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    await deleteEvent(req.params.id, req.user._id, isAdmin);
    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(403).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/events/:id/rsvp
 * RSVP to event
 */
router.post("/:id/rsvp", protect, async (req, res) => {
  try {
    const { status } = req.body; // going, maybe, not-going
    const event = await rsvpToEvent(req.params.id, req.user._id, status);
    res.status(200).json({ success: true, message: "RSVP recorded", event });
  } catch (err) {
    console.error("RSVP error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/events/:id/rsvp
 * Cancel RSVP
 */
router.delete("/:id/rsvp", protect, async (req, res) => {
  try {
    const event = await cancelRsvp(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: "RSVP cancelled", event });
  } catch (err) {
    console.error("Cancel RSVP error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/events/:id/check-in
 * Check-in to event
 */
router.post("/:id/check-in", protect, async (req, res) => {
  try {
    const event = await checkInAttendance(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: "Checked in successfully", event });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/events/:id/check-out
 * Check-out from event
 */
router.post("/:id/check-out", protect, async (req, res) => {
  try {
    const event = await checkOutAttendance(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: "Checked out successfully", event });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
