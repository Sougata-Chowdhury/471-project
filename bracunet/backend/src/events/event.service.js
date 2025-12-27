import Event from "./event.model.js";
import { trackActivity } from "../gamification/gamification.service.js";
import { createNotification, notificationTemplates } from "../notifications/notification.service.js";

/**
 * Create a new event
 */
export async function createEvent(data) {
  const event = await Event.create(data);
  
  // Record gamification activity
  await trackActivity(data.organizer, "event_created", 1, 10);
  
  return event;
}

/**
 * Get all events with filtering and pagination
 */
export async function getAllEvents({ page = 1, limit = 20, status = "published", eventType = "all", upcoming = false }) {
  const skip = (page - 1) * limit;
  
  const query = {};
  
  if (status !== "all") {
    query.status = status;
  }
  
  if (eventType !== "all") {
    query.eventType = eventType;
  }
  
  if (upcoming) {
    query.eventDate = { $gte: new Date() };
  }
  
  const [items, total] = await Promise.all([
    Event.find(query)
      .populate("organizer", "name email role")
      .populate("rsvps.user", "name email")
      .sort({ eventDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(query),
  ]);
  
  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get event by ID
 */
export async function getEventById(eventId) {
  const event = await Event.findById(eventId)
    .populate("organizer", "name email role")
    .populate("rsvps.user", "name email role")
    .populate("attendance.user", "name email role")
    .lean();
    
  if (!event) {
    throw new Error("Event not found");
  }
  
  return event;
}

/**
 * Update event
 */
export async function updateEvent(eventId, userId, updates) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error("Event not found");
  }
  
  // Check if user is organizer or admin
  if (event.organizer.toString() !== userId.toString()) {
    throw new Error("Not authorized to update this event");
  }
  
  // Check if event has RSVPs to send update notifications
  const hasRsvps = event.rsvps.length > 0;
  
  Object.assign(event, updates);
  await event.save();
  
  // Send notifications to users who RSVP'd
  if (hasRsvps) {
    const rsvpedUsers = event.rsvps.map((rsvp) => rsvp.user);
    const updateTemplate = notificationTemplates.event_updated(event.title);
    for (const rsvpUserId of rsvpedUsers) {
      await createNotification({
        userId: rsvpUserId,
        type: "event_updated",
        title: updateTemplate.title,
        message: updateTemplate.message,
        relatedModel: "Event",
        relatedId: eventId
      });
    }
  }
  
  return event;
}

/**
 * Delete event
 */
export async function deleteEvent(eventId, userId, isAdmin = false) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error("Event not found");
  }
  
  // Check if user is organizer or admin
  if (!isAdmin && event.organizer.toString() !== userId.toString()) {
    throw new Error("Not authorized to delete this event");
  }
  
  await Event.findByIdAndDelete(eventId);
  
  return { success: true };
}

/**
 * RSVP to event
 */
export async function rsvpToEvent(eventId, userId, status = "going") {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error("Event not found");
  }
  
  // Check if event is published
  if (event.status !== "published") {
    throw new Error("Cannot RSVP to this event");
  }
  
  // Check capacity
  if (event.capacity && status === "going") {
    const goingCount = event.rsvps.filter((r) => r.status === "going").length;
    if (goingCount >= event.capacity) {
      throw new Error("Event is at full capacity");
    }
  }
  
  // Check if user already RSVP'd
  const existingRsvp = event.rsvps.find((r) => r.user.toString() === userId.toString());
  
  if (existingRsvp) {
    existingRsvp.status = status;
    existingRsvp.rsvpDate = new Date();
  } else {
    event.rsvps.push({
      user: userId,
      status,
      rsvpDate: new Date(),
    });
  }
  
  await event.save();
  
  // Emit real-time event for RSVP update
  if (global.io) {
    global.io.to(`event_${eventId}`).emit('event_rsvp_update', {
      eventId,
      userId,
      status,
      rsvpCount: event.rsvps.filter(r => r.status === 'going').length,
      totalRsvps: event.rsvps.length
    });
  }
  
  // Record gamification activity
  if (status === "going") {
    await trackActivity(userId, "event_rsvp", 1, 5);
    
    // Send notification for event registration
    const registrationTemplate = notificationTemplates.event_registered(event.title);
    await createNotification({
      userId,
      type: "event_registered",
      title: registrationTemplate.title,
      message: registrationTemplate.message,
      relatedModel: "Event",
      relatedId: eventId
    });
  }
  
  return event;
}

/**
 * Cancel RSVP
 */
export async function cancelRsvp(eventId, userId) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error("Event not found");
  }
  
  event.rsvps = event.rsvps.filter((r) => r.user.toString() !== userId.toString());
  await event.save();
  
  // Emit real-time event for RSVP cancellation
  if (global.io) {
    global.io.to(`event_${eventId}`).emit('event_rsvp_update', {
      eventId,
      userId,
      status: 'cancelled',
      rsvpCount: event.rsvps.filter(r => r.status === 'going').length,
      totalRsvps: event.rsvps.length
    });
  }
  
  return event;
}

/**
 * Check-in attendance
 */
export async function checkInAttendance(eventId, userId) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error("Event not found");
  }
  
  // Check if user RSVP'd
  const rsvp = event.rsvps.find((r) => r.user.toString() === userId.toString());
  if (!rsvp || rsvp.status !== "going") {
    throw new Error("Must RSVP to event before checking in");
  }
  
  // Check if already checked in
  const existingAttendance = event.attendance.find((a) => a.user.toString() === userId.toString());
  if (existingAttendance) {
    throw new Error("Already checked in");
  }
  
  event.attendance.push({
    user: userId,
    checkInTime: new Date(),
  });
  
  await event.save();
  
  // Record gamification activity
  await trackActivity(userId, "events_attended", 1, 20);
  
  return event;
}

/**
 * Check-out attendance
 */
export async function checkOutAttendance(eventId, userId) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error("Event not found");
  }
  
  const attendance = event.attendance.find((a) => a.user.toString() === userId.toString());
  
  if (!attendance) {
    throw new Error("Not checked in");
  }
  
  if (attendance.checkOutTime) {
    throw new Error("Already checked out");
  }
  
  attendance.checkOutTime = new Date();
  await event.save();
  
  return event;
}

/**
 * Get events created by user
 */
export async function getMyEvents(userId) {
  const events = await Event.find({ organizer: userId })
    .populate("organizer", "name email")
    .sort({ createdAt: -1 })
    .lean();
    
  return events;
}

/**
 * Get events user RSVP'd to
 */
export async function getMyRsvps(userId) {
  const events = await Event.find({ "rsvps.user": userId })
    .populate("organizer", "name email")
    .sort({ eventDate: 1 })
    .lean();
    
  // Filter to include user's RSVP status
  return events.map((event) => {
    // Since lean() is used, rsvps.user is already an ObjectId (not a document)
    const userRsvp = event.rsvps.find((r) => {
      const rsvpUserId = typeof r.user === 'object' ? r.user._id || r.user : r.user;
      return rsvpUserId.toString() === userId.toString();
    });
    return {
      ...event,
      myRsvpStatus: userRsvp ? userRsvp.status : null,
    };
  });
}

/**
 * Get event analytics
 */
export async function getEventAnalytics(eventId) {
  const event = await Event.findById(eventId)
    .populate("rsvps.user", "name email role")
    .populate("attendance.user", "name email role")
    .lean();
    
  if (!event) {
    throw new Error("Event not found");
  }
  
  const totalRsvps = event.rsvps.length;
  const goingCount = event.rsvps.filter((r) => r.status === "going").length;
  const maybeCount = event.rsvps.filter((r) => r.status === "maybe").length;
  const notGoingCount = event.rsvps.filter((r) => r.status === "not-going").length;
  const attendanceCount = event.attendance.length;
  const attendanceRate = goingCount > 0 ? (attendanceCount / goingCount) * 100 : 0;
  
  return {
    eventId: event._id,
    title: event.title,
    eventDate: event.eventDate,
    totalRsvps,
    goingCount,
    maybeCount,
    notGoingCount,
    attendanceCount,
    attendanceRate: attendanceRate.toFixed(2),
    capacity: event.capacity,
    rsvps: event.rsvps,
    attendance: event.attendance,
  };
}
