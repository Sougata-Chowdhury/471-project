import api from "./api";

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
  
  const response = await api.get(`/events?${queryParams}`);
  return response.data;
};

/**
 * Get single event by ID
 */
export const getEventById = async (eventId) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

/**
 * Get my created events
 */
export const getMyEvents = async () => {
  const response = await api.get('/events/my-events');
  return response.data;
};

/**
 * Get my RSVPs
 */
export const getMyRsvps = async () => {
  const response = await api.get('/events/my-rsvps');
  return response.data;
};

/**
 * Get event analytics
 */
export const getEventAnalytics = async (eventId) => {
  const response = await api.get(`/events/${eventId}/analytics`);
  return response.data;
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
  
  const response = await api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
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
  
  const response = await api.put(`/events/${eventId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};

/**
 * RSVP to event
 */
export const rsvpToEvent = async (eventId, status = "going") => {
  const response = await api.post(`/events/${eventId}/rsvp`, { status });
  return response.data;
};

/**
 * Cancel RSVP
 */
export const cancelRsvp = async (eventId) => {
  const response = await api.delete(`/events/${eventId}/rsvp`);
  return response.data;
};

/**
 * Check-in to event
 */
export const checkInToEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/check-in`);
  return response.data;
};

/**
 * Check-out from event
 */
export const checkOutFromEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/check-out`);
  return response.data;
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
