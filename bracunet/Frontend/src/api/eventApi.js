import api from "./api";

const API_BASE = "http://localhost:3000";

/**
 * Get all events
 */
export const getAllEvents = async (params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 20,
    status: params.status || "published",
    eventType: params.eventType || "all",
    upcoming: params.upcoming || false,
  });
  
  const response = await fetch(`${API_BASE}/api/events?${queryParams}`, {
    credentials: "include",
  });
  return response.json();
};

/**
 * Get single event by ID
 */
export const getEventById = async (eventId) => {
  const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
    credentials: "include",
  });
  return response.json();
};

/**
 * Get my created events
 */
export const getMyEvents = async () => {
  const response = await fetch(`${API_BASE}/api/events/my-events`, {
    credentials: "include",
  });
  return response.json();
};

/**
 * Get my RSVPs
 */
export const getMyRsvps = async () => {
  const response = await fetch(`${API_BASE}/api/events/my-rsvps`, {
    credentials: "include",
  });
  return response.json();
};

/**
 * Get event analytics
 */
export const getEventAnalytics = async (eventId) => {
  const response = await fetch(`${API_BASE}/api/events/${eventId}/analytics`, {
    credentials: "include",
  });
  return response.json();
};

/**
 * Create new event
 */
export const createEvent = async (eventData) => {
  const formData = new FormData();
  
  Object.keys(eventData).forEach((key) => {
    if (eventData[key] !== null && eventData[key] !== undefined) {
      formData.append(key, eventData[key]);
    }
  });
  
  const response = await fetch(`${API_BASE}/api/events`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  
  return response.json();
};

/**
 * Update event
 */
export const updateEvent = async (eventId, updates) => {
  const formData = new FormData();
  
  Object.keys(updates).forEach((key) => {
    if (updates[key] !== null && updates[key] !== undefined) {
      formData.append(key, updates[key]);
    }
  });
  
  const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  
  return response.json();
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId) => {
  const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
    method: "DELETE",
    credentials: "include",
  });
  
  return response.json();
};

/**
 * RSVP to event
 */
export const rsvpToEvent = async (eventId, status = "going") => {
  const response = await fetch(`${API_BASE}/api/events/${eventId}/rsvp`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  
  return response.json();
};

/**
 * Cancel RSVP
 */
export const cancelRsvp = async (eventId) => {
  const response = await fetch(`${API_BASE}/api/events/${eventId}/rsvp`, {
    method: "DELETE",
    credentials: "include",
  });
  
  return response.json();
};

/**
 * Check-in to event
 */
export const checkInToEvent = async (eventId) => {
  const response = await fetch(`${API_BASE}/api/events/${eventId}/check-in`, {
    method: "POST",
    credentials: "include",
  });
  
  return response.json();
};

/**
 * Check-out from event
 */
export const checkOutFromEvent = async (eventId) => {
  const response = await fetch(`${API_BASE}/api/events/${eventId}/check-out`, {
    method: "POST",
    credentials: "include",
  });
  
  return response.json();
};

export default {
  getAllEvents,
  getEventById,
  getMyEvents,
  getMyRsvps,
  getEventAnalytics,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  cancelRsvp,
  checkInToEvent,
  checkOutFromEvent,
};
