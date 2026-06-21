import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import ActivityFeed from "../components/ActivityFeed";
import { useActivityFeed } from "../hooks/useActivityFeed";
import { RESOURCE_STATUS } from "../lib/roles";

export default function AdminDashboard() {
  const { activities, loading: activityLoading } = useActivityFeed(8);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const [users, resources, bookmarks] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("status, download_count"),
        supabase.from("bookmarks").select("id", { count: "exact", head: true }),
      ]);

      const allResources = resources.data || [];
      const totalDownloads = allResources.reduce((sum, r) => sum + (r.download_count || 0), 0);

      setStats({
        totalUsers: users.count || 0,
        totalResources: allResources.length,
        pending: allResources.filter((r) => r.status === RESOURCE_STATUS.PENDING).length,
        approved: allResources.filter((r) => r.status === RESOURCE_STATUS.APPROVED).length,
        rejected: allResources.filter((r) => r.status === RESOURCE_STATUS.REJECTED).length,
        totalDownloads,
        totalBookmarks: bookmarks.count || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const quickActions = [
    { to: "/admin/review", label: "Review Pending", desc: `${stats?.pending ?? 0} awaiting`, color: "bg-orange-50 text-orange-700 border-orange-100" },
    { to: "/admin/users", label: "Manage Users", desc: "Roles & search", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    { to: "/admin/analytics", label: "View Analytics", desc: "Charts & insights", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform overview and management</p>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading stats...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard label="Total Users" value={stats.totalUsers} color="text-indigo-700" />
              <StatCard label="Total Resources" value={stats.totalResources} color="text-blue-700" />
              <StatCard label="Total Downloads" value={stats.totalDownloads} color="text-emerald-700" />
              <StatCard label="Total Bookmarks" value={stats.totalBookmarks} color="text-amber-600" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <StatCard label="Pending" value={stats.pending} color="text-amber-600" sublabel="Awaiting review" />
              <StatCard label="Approved" value={stats.approved} color="text-emerald-600" />
              <StatCard label="Rejected" value={stats.rejected} color="text-red-600" />
            </div>
          </>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <ActivityFeed
          activities={activities}
          loading={activityLoading}
          title="Platform Activity"
          emptyMessage="Activity will appear here as users interact with the platform."
        />
      </div>
    </div>
  );
}
