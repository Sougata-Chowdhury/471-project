import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyRsvps } from "../api/eventApi";

function MyRsvps() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchMyRsvps();
  }, [user, navigate]);
  
  const fetchMyRsvps = async () => {
    try {
      setLoading(true);
      const data = await getMyRsvps();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to fetch RSVPs", err);
    } finally {
      setLoading(false);
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
  
  const isEventUpcoming = (eventDate) => {
    return new Date(eventDate) >= new Date();
  };
  
  const filteredEvents = events.filter((event) => {
    if (filter === "upcoming") return isEventUpcoming(event.eventDate);
    if (filter === "past") return isEventPast(event.eventDate);
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BracuNet</h1>
          <div className="flex items-center gap-4">
            {user && <span className="text-gray-700">{user.name}</span>}
            <button
              onClick={() => navigate("/events")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Back to Events
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">My Registered Events</h2>
          <p className="text-white/90">Events you've signed up for</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === "all"
                  ? "bg-white text-blue-600"
                  : "bg-white/50 text-white hover:bg-white/70"
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === "upcoming"
                  ? "bg-white text-blue-600"
                  : "bg-white/50 text-white hover:bg-white/70"
              }`}
            >
              Upcoming ({events.filter((e) => isEventUpcoming(e.eventDate)).length})
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === "past"
                  ? "bg-white text-blue-600"
                  : "bg-white/50 text-white hover:bg-white/70"
              }`}
            >
              Past ({events.filter((e) => isEventPast(e.eventDate)).length})
            </button>
          </div>
        </div>
        
        {/* Event List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="mt-4 text-white text-xl">Loading your events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-white/70 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-white text-lg mb-4">No registered events found</p>
            <button
              onClick={() => navigate("/events")}
              className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const isPast = isEventPast(event.eventDate);
              const statusColors = {
                going: "bg-green-100 text-green-800 border-green-200",
                maybe: "bg-yellow-100 text-yellow-800 border-yellow-200",
                "not-going": "bg-red-100 text-red-800 border-red-200",
              };
              
              return (
                <div
                  key={event._id}
                  className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Event Image */}
                    {event.image && (
                      <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Event Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {formatEventType(event.eventType)}
                          </span>
                          {isPast && (
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                              Past Event
                            </span>
                          )}
                        </div>
                        
                        {event.myRsvpStatus && (
                          <span
                            className={`px-3 py-1 border rounded-full text-xs font-semibold ${
                              statusColors[event.myRsvpStatus]
                            }`}
                          >
                            {event.myRsvpStatus === "going"
                              ? "Going"
                              : event.myRsvpStatus === "maybe"
                              ? "Maybe"
                              : "Not Going"}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(event.eventDate)}
                        </div>
                        
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {event.startTime} - {event.endTime}
                        </div>
                        
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {event.isVirtual ? "Virtual Event" : event.location}
                        </div>
                        
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Organized by {event.organizer.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRsvps;
