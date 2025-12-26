import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import API from '../api/api';

function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState("all"); // all | student | alumni | faculty | admin
  const [filterVerified, setFilterVerified] = useState("all"); // all | verified | unverified

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users/admin/all');
      const data = res.data;
      if (res.ok && data.success) {
        setUsers(data.users || []);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This will remove all their data including posts, verification requests, etc.`)) {
      return;
    }

    try {
      const res = await API.delete(`/users/${userId}`);
      const data = res.data;
      if (data.success) {
        alert(`User "${userName}" has been deleted successfully.`);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole !== "all" && u.role !== filterRole) return false;
    if (filterVerified === "verified" && !u.isVerified) return false;
    if (filterVerified === "unverified" && u.isVerified) return false;
    return true;
  });

  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">
            BracuNet Admin – Users
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-blue-600 font-semibold hover:text-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">All Users</h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={fetchUsers}
              className="px-3 py-1 rounded-full text-sm border bg-white/20 text-white border-white/60 hover:bg-white/30"
              title="Refresh list"
            >
              🔄 Refresh
            </button>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1 rounded-lg text-sm bg-white/90 text-gray-800"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="px-3 py-1 rounded-lg text-sm bg-white/90 text-gray-800"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-white/80">Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-white/80">No users found for this filter.</p>
        ) : (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-white font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Role</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">Verified</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Joined</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-t border-white/10 hover:bg-white/10">
                    <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-white/90 text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-red-500 text-white"
                            : u.role === "faculty"
                            ? "bg-green-500 text-white"
                            : u.role === "alumni"
                            ? "bg-purple-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {formatRole(u.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.isVerified ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-400 text-white">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/80 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="px-3 py-1 rounded text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-white/80 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
