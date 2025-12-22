import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllEvents, deleteEvent } from "../api/eventApi";
import { io } from 'socket.io-client';
import config from '../config';

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

    // Socket.io for real-time RSVP updates across event list
    const socket = io(config.socketUrl);

    socket.on('event_rsvp_update', (data) => {
      console.log('Real-time RSVP update in list:', data);
      // Refresh events to show updated RSVP counts
      fetchEvents();
    });

    return () => {
      socket.disconnect();
    };
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
      {/* Modern Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BracuNet
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
              )}
              <button
                onClick={() => navigate("/events/my-rsvps")}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                📋 My Events
              </button>
              {user && (
                <button
                  onClick={() => navigate("/events/create")}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  ➕ Create
                </button>
              )}
              <button
                onClick={() => navigate("/dashboard")}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-4">
            <span className="text-6xl sm:text-7xl">📅</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4">Upcoming Events</h2>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            Connect with faculty and alumni through meetups, webinars, workshops, and reunions
          </p>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Event Type Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <span className="text-lg">🎯</span>
                Event Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Upcoming Toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-all duration-200 w-full">
                <input
                  type="checkbox"
                  checked={showUpcoming}
                  onChange={(e) => setShowUpcoming(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="text-lg">⏰</span>
                  Show Upcoming Only
                </span>
              </label>
            </div>
            
            {/* Stats Card */}
            <div className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg px-4 py-3 text-white">
              <div className="text-center">
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm opacity-90">Events Found</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Grid */}
        {loading ? (
          <div className="text-center py-16 sm:py-24">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
            <p className="mt-6 text-white text-lg font-medium">Loading amazing events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 sm:p-16 text-center">
            <span className="text-6xl mb-6 block">🔍</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Events Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for new events</p>
            {user && (
              <button
                onClick={() => navigate("/events/create")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ➕ Create First Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                {/* Event Image with Overlay */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl opacity-50">📅</span>
                    </div>
                  )}
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-blue-700 text-xs font-bold rounded-full shadow-md">
                      {formatEventType(event.eventType)}
                    </span>
                    {isEventPast(event.eventDate) && (
                      <span className="px-3 py-1.5 bg-gray-800/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-md">
                        ⏱️ Past
                      </span>
                    )}
                  </div>
                  
                  {/* Virtual Badge */}
                  {event.isVirtual && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1.5 bg-green-500/95 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-md">
                        🌐 Virtual
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Event Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-base">📅</span>
                      <span className="font-medium">{formatDate(event.eventDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                      <span className="text-base">⏰</span>
                      <span className="font-medium">{event.startTime} - {event.endTime}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                      <span className="text-base">{event.isVirtual ? "🌐" : "📍"}</span>
                      <span className="font-medium line-clamp-1">
                        {event.isVirtual ? "Virtual Event" : event.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                      <span className="text-base">👥</span>
                      <span className="font-medium">
                        {event.rsvps?.filter((r) => r.status === "going").length || 0} Registered
                        {event.capacity && ` / ${event.capacity}`}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {(isAdmin || (user && event.organizer._id === user._id)) && (
                    <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/events/edit/${event._id}`)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                      >
                        🗑️ Delete
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
