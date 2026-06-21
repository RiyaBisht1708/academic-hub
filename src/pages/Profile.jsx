import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { SEMESTERS, formatDate } from "../lib/resourceUtils";

export default function Profile() {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: userProfile?.fullName || "",
    branch: userProfile?.branch || "",
    semester: userProfile?.semester?.toString() || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setForm({
      fullName: userProfile?.fullName || "",
      branch: userProfile?.branch || "",
      semester: userProfile?.semester?.toString() || "",
    });
    setError("");
    setSuccess("");
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName || !form.branch || !form.semester) {
      setError("Name, branch, and semester are required.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        fullName: form.fullName,
        branch: form.branch,
        semester: form.semester,
      });
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8 text-white">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-4">
              {(userProfile?.fullName || currentUser?.email || "?").charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold">{userProfile?.fullName || "Your Profile"}</h1>
            <p className="text-blue-100 mt-1">{currentUser?.email}</p>
          </div>

          <div className="p-6">
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

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                  <input
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Semester</option>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>{`Semester ${s}`}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</dt>
                    <dd className="mt-1 font-semibold text-slate-800">{userProfile?.fullName || "—"}</dd>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</dt>
                    <dd className="mt-1 font-semibold text-slate-800">{currentUser?.email || "—"}</dd>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Branch</dt>
                    <dd className="mt-1 font-semibold text-slate-800">{userProfile?.branch || "—"}</dd>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Semester</dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {userProfile?.semester ? `Semester ${userProfile.semester}` : "—"}
                    </dd>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Role</dt>
                    <dd className="mt-1 font-semibold text-slate-800">{userProfile?.role || "Student"}</dd>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Uploads</dt>
                    <dd className="mt-1 font-semibold text-slate-800">{userProfile?.uploadCount ?? 0}</dd>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Joined</dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {formatDate(userProfile?.createdAt)}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="bg-blue-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-800"
                  >
                    Edit Profile
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
