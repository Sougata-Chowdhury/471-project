import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createEvent, updateEvent, getEventById } from "../api/eventApi";

const eventTypes = [
  { value: "meetup", label: "Faculty-Alumni Meetup" },
  { value: "webinar", label: "Webinar" },
  { value: "reunion", label: "Reunion" },
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "other", label: "Other" },
];

function CreateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "meetup",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    isVirtual: false,
    meetingLink: "",
    capacity: "",
    status: "published",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (isEditMode) {
      fetchEvent();
    }
  }, [id]);
  
  const fetchEvent = async () => {
    try {
      const data = await getEventById(id);
      if (data.success) {
        const event = data.event;
        setFormData({
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          eventDate: new Date(event.eventDate).toISOString().split("T")[0],
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          isVirtual: event.isVirtual,
          meetingLink: event.meetingLink || "",
          capacity: event.capacity || "",
          status: event.status,
        });
      }
    } catch (err) {
      console.error("Failed to fetch event", err);
      setError("Failed to load event");
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!formData.title || !formData.description || !formData.eventDate) {
      setError("Please fill in all required fields");
      return;
    }
    
    // Date validation - can't be in the past
    const selectedDate = new Date(formData.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (selectedDate < today) {
      setError("Event date cannot be in the past");
      return;
    }
    
    // Time validation
    if (!formData.startTime || !formData.endTime) {
      setError("Please provide both start and end times");
      return;
    }
    
    // Convert times to comparable format
    const [startHour, startMin] = formData.startTime.split(':').map(Number);
    const [endHour, endMin] = formData.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      setError("End time must be after start time");
      return;
    }
    
    // Check if event is too short (less than 15 minutes)
    if (endMinutes - startMinutes < 15) {
      setError("Event must be at least 15 minutes long");
      return;
    }
    
    // Check if event is unreasonably long (more than 12 hours)
    if (endMinutes - startMinutes > 720) {
      setError("Event duration cannot exceed 12 hours");
      return;
    }
    
    // If event is today, check if start time is not in the past
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (startMinutes < currentMinutes) {
        setError("Start time cannot be in the past for today's events");
        return;
      }
    }
    
    if (formData.isVirtual && !formData.meetingLink) {
      setError("Please provide a meeting link for virtual events");
      return;
    }
    
    // Capacity validation
    if (formData.capacity && parseInt(formData.capacity) < 1) {
      setError("Capacity must be at least 1 person");
      return;
    }
    
    try {
      setLoading(true);
      
      const eventData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };
      
      if (imageFile) {
        eventData.image = imageFile;
      }
      
      let data;
      if (isEditMode) {
        data = await updateEvent(id, eventData);
      } else {
        data = await createEvent(eventData);
      }
      
      if (data.success) {
        alert(`Event ${isEditMode ? "updated" : "created"} successfully!`);
        navigate(`/events/${data.event._id}`);
      } else {
        setError(data.message || `Failed to ${isEditMode ? "update" : "create"} event`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(`Failed to ${isEditMode ? "update" : "create"} event`);
    } finally {
      setLoading(false);
    }
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
              onClick={() => navigate("/events")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Back to Events
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            {isEditMode ? "Edit Event" : "Create Event"}
          </h2>
          <p className="text-white/90">
            {isEditMode ? "Update event details" : "Organize a faculty-alumni meetup, webinar, or reunion"}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Faculty-Alumni Tech Meetup 2025"
                required
              />
            </div>
            
            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your event..."
                required
              />
            </div>
            
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Event must be at least 15 minutes</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be after start time</p>
              </div>
            </div>
            
            {/* Virtual Event Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVirtual"
                name="isVirtual"
                checked={formData.isVirtual}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isVirtual" className="text-sm font-medium text-gray-700">
                This is a virtual event
              </label>
            </div>
            
            {/* Location or Meeting Link */}
            {formData.isVirtual ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://zoom.us/j/..."
                  required={formData.isVirtual}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., University Auditorium"
                  required={!formData.isVirtual}
                />
              </div>
            )}
            
            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity (Optional)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Maximum number of attendees"
              />
            </div>
            
            {/* Event Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a cover image for your event
              </p>
            </div>
            
            {/* Status (for edit mode) */}
            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? "Saving..." : isEditMode ? "Update Event" : "Create Event"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
