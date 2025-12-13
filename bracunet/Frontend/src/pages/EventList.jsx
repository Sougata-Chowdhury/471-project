import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllEvents, deleteEvent } from "../api/eventApi";

const eventTypes = [
  { value: "all", label: "All Events" },
  { value: "meetup", label: "Meetups" },
  { value: "webinar", label: "Webinars" },
  { value: "reunion", label: "Reunions" },
  { value: "workshop", label: "Workshops" },
  { value: "seminar", label: "Seminars" },
  { value: "other", label: "Other" },
];

function EventList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [showUpcoming, setShowUpcoming] = useState(true);
  
  const isAdmin = user && user.role === "admin";
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEvents({
        page: 1,
        limit: 50,
        eventType: selectedType,
        upcoming: showUpcoming,
        status: "published",
      });
      setEvents(data.items || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, [selectedType, showUpcoming]);
  
  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await deleteEvent(eventId);
      fetchEvents();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete event");
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const formatEventType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const isEventPast = (eventDate) => {
    return new Date(eventDate) < new Date();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BracuNet</h1>
          <div className="flex items-center gap-4">
            {user && <span className="text-gray-700">{user.name}</span>}
            <button
              onClick={() => navigate("/events/my-rsvps")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
            >
              My Events
            </button>
            {user && (
              <button
                onClick={() => navigate("/events/create")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
              >
                Create Event
              </button>
            )}
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Events</h2>
          <p className="text-white/90">Discover and join faculty-alumni meetups, webinars, and reunions</p>
        </div>

        {/* Filters */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-white mb-2">
                Event Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="upcoming"
                checked={showUpcoming}
                onChange={(e) => setShowUpcoming(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="upcoming" className="text-sm font-semibold text-white">
                Show Upcoming Only
              </label>
            </div>
          </div>
        </div>
        
        {/* Event Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="mt-4 text-white">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-12 text-center">
            <p className="text-white text-lg">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                {/* Event Image */}
                {event.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                {/* Event Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {formatEventType(event.eventType)}
                    </span>
                    {isEventPast(event.eventDate) && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        Past
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.eventDate)}
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.startTime} - {event.endTime}
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.isVirtual ? "Virtual Event" : event.location}
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {event.rsvps?.filter((r) => r.status === "going").length || 0} Registered
                      {event.capacity && ` / ${event.capacity}`}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {(isAdmin || (user && event.organizer._id === user._id)) && (
                    <div className="mt-4 flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/events/edit/${event._id}`)}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;
