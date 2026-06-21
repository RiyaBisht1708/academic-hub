import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../hooks/useBookmarks";
import { useRole } from "../hooks/useRole";
import Navbar from "../components/Navbar";
import ResourceCard from "../components/ResourceCard";
import ActivityFeed from "../components/ActivityFeed";
import { formatDate, mapResource } from "../lib/resourceUtils";
import { RESOURCE_STATUS } from "../lib/roles";
import { useActivityFeed } from "../hooks/useActivityFeed";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const { bookmarkCount } = useBookmarks();
  const { isAdmin } = useRole();
  const { activities, loading: activityLoading } = useActivityFeed(6);
  const [recentUploads, setRecentUploads] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentUser) return;

      setLoadingRecent(true);

      const [recentResult, pendingResult] = await Promise.all([
        supabase
          .from("resources")
          .select("*")
          .eq("uploader_id", currentUser.uid)
          .order("created_at", { ascending: false })
          .limit(3),
        isAdmin
          ? supabase
              .from("resources")
              .select("id", { count: "exact", head: true })
              .eq("status", RESOURCE_STATUS.PENDING)
          : Promise.resolve({ count: 0 }),
      ]);

      setRecentUploads((recentResult.data || []).map(mapResource));
      setPendingCount(pendingResult.count || 0);
      setLoadingRecent(false);
    }

    fetchDashboardData();
  }, [currentUser, isAdmin]);

  const studentActions = [
    { to: "/resources", label: "Browse Resources", desc: "Find notes & papers", color: "bg-blue-50 text-blue-700 border-blue-100" },
    { to: "/resources", label: "Upload PDF", desc: "Share study material", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { to: "/bookmarks", label: "My Bookmarks", desc: "Saved resources", color: "bg-amber-50 text-amber-700 border-amber-100" },
    { to: "/profile", label: "Edit Profile", desc: "Update your details", color: "bg-purple-50 text-purple-700 border-purple-100" },
  ];

  const adminActions = [
    { to: "/admin/dashboard", label: "Admin Dashboard", desc: "Platform stats", color: "bg-slate-50 text-slate-700 border-slate-200" },
    { to: "/admin/review", label: "Review Queue", desc: `${pendingCount} pending`, color: "bg-orange-50 text-orange-700 border-orange-100" },
    { to: "/admin/users", label: "Manage Users", desc: "Assign roles", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    { to: "/admin/analytics", label: "Analytics", desc: "Charts & insights", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  ];

  const quickActions = isAdmin ? [...adminActions, ...studentActions] : studentActions;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {getGreeting()}, {userProfile?.fullName?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back to Cloud Academic Resource Hub
            {isAdmin && (
              <span className="ml-2 inline-flex items-center text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
            <p className="text-sm text-slate-500">Uploads</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{userProfile?.uploadCount ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
            <p className="text-sm text-slate-500">Bookmarks</p>
            <p className="text-3xl font-bold text-amber-500 mt-1">{bookmarkCount}</p>
          </div>
          {isAdmin ? (
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
              <p className="text-sm text-slate-500">Pending Review</p>
              <p className="text-3xl font-bold text-orange-500 mt-1">{pendingCount}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
              <p className="text-sm text-slate-500">Semester</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {userProfile?.semester ?? "—"}
              </p>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
            <p className="text-sm text-slate-500">Branch</p>
            <p className="text-xl font-bold text-slate-800 mt-1 truncate">
              {userProfile?.branch ?? "—"}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={`rounded-xl border p-4 hover:shadow-md transition-shadow ${action.color}`}
              >
                <p className="font-semibold">{action.label}</p>
                <p className="text-sm opacity-80 mt-1">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Your Recent Uploads</h2>
            <Link to="/resources" className="text-sm text-blue-700 font-medium hover:text-blue-800">
              View all →
            </Link>
          </div>

          {loadingRecent && <p className="text-slate-500">Loading...</p>}

          {!loadingRecent && recentUploads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">You have not uploaded any resources yet.</p>
              <Link
                to="/resources"
                className="inline-block bg-blue-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-800"
              >
                Upload your first PDF
              </Link>
            </div>
          )}

          {!loadingRecent && recentUploads.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentUploads.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} showBookmark={false} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <ActivityFeed
            activities={activities}
            loading={activityLoading}
            title="Recent Activity"
            emptyMessage="Activity will appear as users upload, bookmark, and download resources."
          />
        </div>

        <div className="mt-6 text-sm text-slate-500">
          Member since {formatDate(userProfile?.createdAt)}
        </div>
      </div>
    </div>
  );
}
