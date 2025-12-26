import React, { useEffect, useState } from "react";
import API from "../api/api";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../config";

const Mentorship = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [skillQuery, setSkillQuery] = useState("");
  const [interest, setInterest] = useState("");
  const [interestQuery, setInterestQuery] = useState("");
  const [goal, setGoal] = useState("");
  const [goalQuery, setGoalQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const [mentorsRes, requestsRes] = await Promise.all([
          API.get('/mentorship/mentors'),
          API.get('/mentorship/my-requests'),
        ]);
        setMentors(mentorsRes.data);
        setMyRequests(requestsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load mentors");
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const getRequestStatus = (mentorId) => {
    const req = myRequests.find((r) => r.mentor?._id === mentorId || r.mentor === mentorId);
    return req ? req.status : null;
  };

  const sendRequest = async (mentorId) => {
    try {
      const existingStatus = getRequestStatus(mentorId);
      if (existingStatus && existingStatus !== "rejected") {
        alert(`You already have a ${existingStatus} request with this mentor.`);
        navigate("/mentorship/chat");
        return;
      }
      console.log('Sending mentorship request to:', mentorId);
      const requestRes = await API.post(
        '/mentorship/request',
        { mentorId }
      );

      console.log('Request created:', requestRes.data);

      // Send initial message
      const messageRes = await API.post(
        '/mentorship/message/send',
        {
          mentorshipId: requestRes.data._id,
          message: `Hi! I'd like to connect with you as my mentor.`,
          receiverId: mentorId,
        }
      );

      console.log('Initial message sent:', messageRes.data);
      alert("Mentorship request sent ✅ Check your messages!");
      try {
        const requestsRes = await API.get('/mentorship/my-requests');
        setMyRequests(requestsRes.data || []);
      } catch {}
      navigate("/mentorship/chat");
    } catch (err) {
      const backendMsg = err.response?.data?.message;
      const msg = backendMsg || (err.request ? "Server unreachable. Please start backend (3000)." : "Unexpected error.");
      console.error('Request error:', err.response?.data || err.message);
      alert(msg);
      const lower = (backendMsg || "").toLowerCase();
      if (lower.includes("request already")) {
        navigate("/mentorship/chat");
      }
    }
  };

  const startMessageToMentor = (mentor) => {
    setSelectedMentor(mentor);
    setMessageDraft("");
    setShowMessageModal(true);
  };

  const sendMessageToMentor = async () => {
    if (!selectedMentor || !messageDraft.trim()) return;
    try {
      const convRes = await API.post(
        '/mentorship/conversation/start',
        { mentorId: selectedMentor._id }
      );

      await API.post(
        '/mentorship/message/send',
        {
          mentorshipId: convRes.data._id,
          message: messageDraft,
          receiverId: selectedMentor._id,
        }
      );

      setShowMessageModal(false);
      setSelectedMentor(null);
      setMessageDraft("");
      alert("Message request sent ✅");
      navigate("/mentorship/chat");
    } catch (err) {
      console.error('Message request error:', err.response?.data);
      alert(err.response?.data?.message || "Failed to send message request");
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    const term = search.trim().toLowerCase();
    const nameMatch = mentor.name.toLowerCase().includes(term);
    const anyFieldMatch = term === "" ||
      nameMatch ||
      (mentor.skills || []).some((s) => s.toLowerCase().includes(term)) ||
      (mentor.interests || []).some((i) => i.toLowerCase().includes(term)) ||
      (mentor.mentorshipGoals || []).some((g) => g.toLowerCase().includes(term));

    const skillMatch = skill === "" ||
      (mentor.skills || []).some((s) => s.toLowerCase().includes(skill.toLowerCase()));

    const interestMatch = interest === "" ||
      (mentor.interests || []).some((i) => i.toLowerCase().includes(interest.toLowerCase()));

    const goalMatch = goal === "" ||
      (mentor.mentorshipGoals || []).some((g) => g.toLowerCase().includes(goal.toLowerCase()));

    return anyFieldMatch && skillMatch && interestMatch && goalMatch;
  });

  // Build unique skill list for typeahead suggestions
  const allSkills = Array.from(
    new Set(mentors.flatMap((m) => m.skills || []))
  ).sort((a, b) => a.localeCompare(b));

  const allInterests = Array.from(
    new Set(mentors.flatMap((m) => m.interests || []))
  ).sort((a, b) => a.localeCompare(b));

  const allGoals = Array.from(
    new Set(mentors.flatMap((m) => m.mentorshipGoals || []))
  ).sort((a, b) => a.localeCompare(b));

  const skillSuggestions = skillQuery.trim().length
    ? allSkills.filter((s) => s.toLowerCase().includes(skillQuery.toLowerCase().trim()))
    : allSkills.slice(0, 8);

  const interestSuggestions = interestQuery.trim().length
    ? allInterests.filter((s) => s.toLowerCase().includes(interestQuery.toLowerCase().trim()))
    : allInterests.slice(0, 8);

  const goalSuggestions = goalQuery.trim().length
    ? allGoals.filter((s) => s.toLowerCase().includes(goalQuery.toLowerCase().trim()))
    : allGoals.slice(0, 8);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading mentors...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600 font-semibold">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white font-semibold hover:underline"
          >
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={() => navigate('/mentorship/chat')}
            className="ml-auto bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded font-semibold"
          >
            Open Chat
          </button>
        </div>

        <h1 className="text-4xl font-bold text-white mb-6">
          🎓 Find a Mentor
        </h1>

        {/* 🔍 Search Section */}
        <div className="bg-white rounded-lg p-6 shadow mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name"
              className="border p-3 rounded pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <input
              list="skill-options"
              type="text"
              placeholder="Filter by skill"
              className="border p-3 rounded w-full"
              value={skillQuery}
              onChange={(e) => {
                setSkillQuery(e.target.value);
                setSkill(e.target.value);
              }}
              onFocus={() => setSkillQuery(skillQuery || " ")}
              onBlur={() => setTimeout(() => setSkillQuery(skill), 200)}
            />
            {skillQuery.trim() && skillSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto w-full">
                {skillSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-blue-50"
                    onClick={() => {
                      setSkill(s);
                      setSkillQuery(s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <input
              list="interest-options"
              type="text"
              placeholder="Filter by interest"
              className="border p-3 rounded w-full"
              value={interestQuery}
              onChange={(e) => {
                setInterestQuery(e.target.value);
                setInterest(e.target.value);
              }}
              onFocus={() => setInterestQuery(interestQuery || " ")}
              onBlur={() => setTimeout(() => setInterestQuery(interest), 200)}
            />
            {interestQuery.trim() && interestSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto w-full">
                {interestSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-blue-50"
                    onClick={() => {
                      setInterest(s);
                      setInterestQuery(s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <input
              list="goal-options"
              type="text"
              placeholder="Filter by goal"
              className="border p-3 rounded w-full"
              value={goalQuery}
              onChange={(e) => {
                setGoalQuery(e.target.value);
                setGoal(e.target.value);
              }}
              onFocus={() => setGoalQuery(goalQuery || " ")}
              onBlur={() => setTimeout(() => setGoalQuery(goal), 200)}
            />
            {goalQuery.trim() && goalSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto w-full">
                {goalSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-blue-50"
                    onClick={() => {
                      setGoal(s);
                      setGoalQuery(s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSearch("");
              setSkill("");
              setSkillQuery("");
              setInterest("");
              setInterestQuery("");
              setGoal("");
              setGoalQuery("");
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-3 font-semibold"
          >
            Clear
          </button>
        </div>

        {/* 👨‍🏫 Mentor Cards */}
        {filteredMentors.length === 0 ? (
          <p className="text-white text-center">No mentors found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-600">
                  {mentor.name}
                </h3>

                {mentor.score !== undefined && (
                  <div className="mt-1 mb-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {mentor.score}% Match
                    </span>
                  </div>
                )}

                <p className="text-gray-600 mt-1">
                  🎯 {mentor.role}
                </p>

                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills?.length > 0 ? (
                      mentor.skills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No skills listed</span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Interests:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.interests?.length > 0 ? (
                      mentor.interests.map((i, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs"
                        >
                          {i}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No interests listed</span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Goals:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.mentorshipGoals?.length > 0 ? (
                      mentor.mentorshipGoals.map((g, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No goals listed</span>
                    )}
                  </div>
                </div>

                {user.role === "student" && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {(() => {
                      const status = getRequestStatus(mentor._id);
                      const disabled = status && status !== "rejected";
                      const label = disabled ? `${status} request` : "Request Mentorship";
                      return (
                        <button
                          onClick={() => !disabled && sendRequest(mentor._id)}
                          disabled={disabled}
                          className={`w-full py-2 rounded font-semibold ${disabled ? "bg-gray-300 text-gray-600" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                        >
                          {label}
                        </button>
                      );
                    })()}
                    <button
                      onClick={() => startMessageToMentor(mentor)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded font-semibold"
                    >
                      Message
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showMessageModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">Message {selectedMentor.name}</h3>
            <p className="text-sm text-gray-600 mb-4">This will send a message request. The mentor can reply to start chatting.</p>
            <textarea
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              placeholder="Write your message..."
              className="w-full border border-gray-300 rounded p-3 h-28"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={sendMessageToMentor}
                disabled={!messageDraft.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded px-4 py-2"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;
