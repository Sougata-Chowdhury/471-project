import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getGroups, joinGroup } from "../api";
import { CreateGroup } from "./CreateGroup";
import { useNavigate } from "react-router-dom";

const ForumList = () => {
  const [groups, setGroups] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    getGroups()
      .then((res) => setGroups(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleJoinRequest = async (groupId) => {
    try {
      await joinGroup(groupId);
      setGroups(groups.map(g => 
        g._id === groupId ? { ...g, joinStatus: "pending" } : g
      ));
      alert("Join request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send join request");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Discussion Forum</h1>

      {/* Create Group (Admin/Faculty/Alumni only) */}
      {["admin", "faculty", "alumni"].includes(user.role) && (
        <div className="mb-6">
          <CreateGroup
            onCreated={(group) => setGroups([...groups, group])}
          />
        </div>
      )}

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const joined = group.joinStatus === "approved";
          const pending = group.joinStatus === "pending";

          return (
            <div
              key={group._id}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-5 cursor-pointer hover:shadow-xl transition border-t-4 border-indigo-400"
            >
              <h2 className="font-bold text-lg text-gray-800">{group.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{group.topic}</p>
              {group.description && (
                <p className="text-gray-500 text-sm mt-2">{group.description}</p>
              )}

              <p className="text-gray-400 text-xs mt-2">
                Created by: {group.createdBy?.name || "Unknown"}
              </p>

              {joined ? (
                <button
                  className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => navigate(`/forum/${group._id}`)}
                >
                  Enter
                </button>
              ) : pending ? (
                <button
                  disabled
                  className="mt-3 bg-yellow-400 text-white px-4 py-2 rounded cursor-not-allowed"
                >
                  Pending Approval
                </button>
              ) : (
                <button
                  className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => handleJoinRequest(group._id)}
                >
                  Request to Join
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForumList;
