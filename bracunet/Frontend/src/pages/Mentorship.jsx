import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

const Mentorship = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/mentorship/mentors", {
          withCredentials: true,
        });
        setMentors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const sendRequest = async (mentorId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/mentorship/request",
        { mentorId },
        { withCredentials: true }
      );
      alert("Mentorship request sent ✅");
    } catch (err) {
      alert("Already requested or error occurred");
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    return (
      mentor.name.toLowerCase().includes(search.toLowerCase()) &&
      (skill === "" || mentor.skills.includes(skill))
    );
  });

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading mentors...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-white mb-6">
          🎓 Find a Mentor
        </h1>

        {/* 🔍 Search Section */}
        <div className="bg-white rounded-lg p-6 shadow mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name"
            className="border p-3 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Filter by skill (e.g. React, AI)"
            className="border p-3 rounded"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />

          <button
            onClick={() => {
              setSearch("");
              setSkill("");
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

                <p className="text-gray-600 mt-1">
                  🎯 {mentor.role}
                </p>

                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {user.role === "student" && (
                  <button
                    onClick={() => sendRequest(mentor._id)}
                    className="mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
                  >
                    Request Mentorship
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
