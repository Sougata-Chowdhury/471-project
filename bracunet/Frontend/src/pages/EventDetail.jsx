import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getEventById,
  rsvpToEvent,
  cancelRsvp,
  checkInToEvent,
  getEventAnalytics,
} from "../api/eventApi";
import { io } from 'socket.io-client';
import config from '../config';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const socketRef = useRef(null);
  
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await getEventById(id);
      if (data.success) {
        setEvent(data.event);
      }
    } catch (err) {
      console.error("Failed to fetch event", err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      const data = await getEventAnalytics(id);
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
  };
  
  useEffect(() => {
    fetchEvent();

    // Socket.io for real-time RSVP updates
    if (id) {
      const socket = io(config.socketUrl, { transports: ['websocket'] });
      socketRef.current = socket;
      socket.emit('joinEventRoom', { eventId: id });

      socket.on('event_rsvp_update', (data) => {
        if (data.eventId === id) {
          console.log('Real-time RSVP update:', data);
          fetchEvent(); // Refresh event data
        }
      });

      return () => {
        socket.emit('leaveEventRoom', { eventId: id });
        socket.disconnect();
      };
    }
  }, [id]);
  
  const handleRsvp = async (status) => {
    if (!user) {
      alert("Please login to RSVP");
      navigate("/login");
      return;
    }
    
    try {
      setActionLoading(true);
      const data = await rsvpToEvent(id, status);
      if (data.success) {
        alert("RSVP recorded successfully!");
        fetchEvent();
      } else {
        alert(data.message || "Failed to RSVP");
      }
    } catch (err) {
      console.error("RSVP error:", err);
      alert("Failed to RSVP");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleCancelRsvp = async () => {
    if (!confirm("Are you sure you want to cancel your RSVP?")) return;
    
    try {
      setActionLoading(true);
      const data = await cancelRsvp(id);
      if (data.success) {
        alert("RSVP cancelled");
        fetchEvent();
      }
    } catch (err) {
      console.error("Cancel RSVP error:", err);
      alert("Failed to cancel RSVP");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const data = await checkInToEvent(id);
      if (data.success) {
        alert("Checked in successfully!");
        fetchEvent();
      } else {
        alert(data.message || "Failed to check in");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      alert("Failed to check in");
    } finally {
      setActionLoading(false);
    }
  };
  
  const toggleAnalytics = () => {
    if (!showAnalytics && !analytics) {
      fetchAnalytics();
    }
    setShowAnalytics(!showAnalytics);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const formatEventType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const getUserRsvp = () => {
    if (!user || !event) return null;
    return event.rsvps.find((r) => r.user._id === user._id);
  };
  
  const hasUserCheckedIn = () => {
    if (!user || !event) return false;
    return event.attendance.some((a) => a.user._id === user._id);
  };
  
  const isOrganizer = user && event && event.organizer._id === user._id;
  const isAdmin = user && user.role === "admin";
  const canViewAnalytics = isOrganizer || isAdmin;
  
  const userRsvp = getUserRsvp();
  const hasCheckedIn = hasUserCheckedIn();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-white text-xl">Loading event...</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Event not found</p>
          <button
            onClick={() => navigate("/events")}
            className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  const isEventPast = new Date(event.eventDate) < new Date();
  const isEventToday = new Date(event.eventDate).toDateString() === new Date().toDateString();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BracuNet</h1>
          <div className="flex items-center gap-4">
            {user && <span className="text-gray-700">{user.name}</span>}
            {(isOrganizer || isAdmin) && (
              <>
                <button
                  onClick={() => navigate(`/events/edit/${event._id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Edit Event
                </button>
                {canViewAnalytics && (
                  <button
                    onClick={toggleAnalytics}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    {showAnalytics ? "Hide Analytics" : "Analytics"}
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => navigate("/events")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Back to Events
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Event Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-6">
          {event.image && (
            <div className="h-96 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-3">
                  {formatEventType(event.eventType)}
                </span>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {event.title}
                </h1>
                <p className="text-gray-600">
                  Organized by {event.organizer.name}
                </p>
              </div>
              {isEventPast && (
                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full">
                  Event Ended
                </span>
              )}
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {event.description}
            </p>
            
            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDate(event.eventDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {event.isVirtual ? "Virtual Event" : event.location}
                  </p>
                  {event.isVirtual && event.meetingLink && (
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Join Meeting →
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Attendance</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {event.rsvps.filter((r) => r.status === "going").length} Registered
                    {event.capacity && ` / ${event.capacity} capacity`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Registration Status */}
            {userRsvp && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  You registered as: <span className="capitalize">{userRsvp.status.replace("-", " ")}</span>
                </p>
                {hasCheckedIn && (
                  <p className="text-green-700 text-sm mt-1">
                    ✓ You have checked in to this event
                  </p>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            {user && !isEventPast && (
              <div className="flex flex-wrap gap-3">
                {!userRsvp ? (
                  <>
                    <button
                      onClick={() => handleRsvp("going")}
                      disabled={actionLoading}
                      className="flex-1 min-w-[150px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      Register - Going
                    </button>
                    <button
                      onClick={() => handleRsvp("maybe")}
                      disabled={actionLoading}
                      className="flex-1 min-w-[150px] px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium"
                    >
                      Register - Maybe
                    </button>
                  </>
                ) : (
                  <>
                    {isEventToday && userRsvp.status === "going" && !hasCheckedIn && (
                      <button
                        onClick={handleCheckIn}
                        disabled={actionLoading}
                        className="flex-1 min-w-[150px] px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      >
                        Check In
                      </button>
                    )}
                    <button
                      onClick={handleCancelRsvp}
                      disabled={actionLoading}
                      className="flex-1 min-w-[150px] px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                      Cancel Registration
                    </button>
                  </>
                )}
              </div>
            )}
            
            {!user && !isEventPast && (
              <button
                onClick={() => navigate("/login")}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Login to Register
              </button>
            )}
          </div>
        </div>
        
        {/* Analytics Section */}
        {showAnalytics && analytics && (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-blue-600 font-medium">Total Registrations</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{analytics.totalRsvps}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-sm text-green-600 font-medium">Going</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{analytics.goingCount}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <p className="text-sm text-purple-600 font-medium">Checked In</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{analytics.attendanceCount}</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-6">
                <p className="text-sm text-yellow-600 font-medium">Attendance Rate</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{analytics.attendanceRate}%</p>
              </div>
            </div>
            
            {/* Attendee Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration List</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.rsvps.map((rsvp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{rsvp.user.name}</p>
                        <p className="text-sm text-gray-600">{rsvp.user.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rsvp.status === "going" ? "bg-green-100 text-green-800" :
                        rsvp.status === "maybe" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {rsvp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance List</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.attendance.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{att.user.name}</p>
                        <p className="text-sm text-gray-600">{att.user.email}</p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(att.checkInTime).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetail;
