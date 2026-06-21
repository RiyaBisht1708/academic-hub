import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import { formatDate } from "../lib/resourceUtils";
import { ROLES } from "../lib/roles";
import { bookmarkCountByUser } from "../lib/analytics";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [bookmarkCounts, setBookmarkCounts] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingId, setSavingId] = useState(null);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const [usersRes, bookmarksRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("bookmarks").select("user_id, resource_id"),
      ]);

      if (usersRes.error) throw usersRes.error;
      setUsers(usersRes.data || []);
      setBookmarkCounts(bookmarkCountByUser(bookmarksRes.data || []));
    } catch (err) {
      setError("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function updateRole(userId, role) {
    setSavingId(userId);
    setError("");
    setSuccess("");
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (updateError) throw updateError;
      setSuccess("User role updated successfully.");
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  const filtered = users.filter((user) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      user.full_name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.branch?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-500 mt-1">View users, search, and assign roles</p>
        </div>

        <input
          type="search"
          placeholder="Search by name, email, or branch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-slate-200 rounded-lg px-4 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm border border-green-100">
            {success}
          </div>
        )}

        {loading && <p className="text-slate-600">Loading users...</p>}

        {!loading && (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden md:table-cell">Branch</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Semester</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Uploads</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Bookmarks</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden lg:table-cell">Joined</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{user.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{user.branch}</td>
                      <td className="px-4 py-3 text-slate-600">{user.semester}</td>
                      <td className="px-4 py-3 text-slate-600">{user.upload_count}</td>
                      <td className="px-4 py-3 text-slate-600">{bookmarkCounts[user.id] || 0}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={savingId === user.id}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value={ROLES.STUDENT}>Student</option>
                          <option value={ROLES.ADMIN}>Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <p className="text-slate-500 text-center py-8">No users match your search.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
