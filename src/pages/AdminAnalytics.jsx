import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import SimpleBarChart, { MultiBarChart } from "../components/charts/SimpleBarChart";
import {
  countByField,
  countByMonth,
  topUploaders,
  topByField,
  countBookmarkedResources,
} from "../lib/analytics";
import { mapResource } from "../lib/resourceUtils";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      const [resourcesRes, profilesRes, bookmarksRes] = await Promise.all([
        supabase.from("resources").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("bookmarks").select("*"),
      ]);

      const resources = (resourcesRes.data || []).map(mapResource);
      const profiles = profilesRes.data || [];
      const bookmarks = bookmarksRes.data || [];

      const uploadsByMonth = countByMonth(resources, "createdAt");
      const usersByMonth = countByMonth(profiles, "created_at");

      const monthlyGrowth = uploadsByMonth.map((u) => {
        const match = usersByMonth.find((m) => m.name === u.name);
        return { name: u.name, uploads: u.value, users: match?.value || 0 };
      });

      usersByMonth.forEach((m) => {
        if (!monthlyGrowth.find((g) => g.name === m.name)) {
          monthlyGrowth.push({ name: m.name, uploads: 0, users: m.value });
        }
      });

      setCharts({
        bySubject: countByField(resources, "subject").slice(0, 6),
        bySemester: countByField(resources, "semester").slice(0, 8),
        topUploaders: topUploaders(resources),
        mostDownloaded: topByField(resources, "downloadCount"),
        mostBookmarked: countBookmarkedResources(bookmarks, resources),
        monthlyGrowth: monthlyGrowth.sort((a, b) => a.name.localeCompare(b.name)),
        totals: {
          uploads: resources.length,
          users: profiles.length,
          downloads: resources.reduce((s, r) => s + (r.downloadCount || 0), 0),
          bookmarks: bookmarks.length,
        },
      });
      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform insights and engagement metrics</p>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading analytics...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total Uploads</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{charts.totals.uploads}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total Users</p>
                <p className="text-3xl font-bold text-indigo-700 mt-1">{charts.totals.users}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total Downloads</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{charts.totals.downloads}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total Bookmarks</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{charts.totals.bookmarks}</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-800 mb-4">Resource Statistics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SimpleBarChart data={charts.bySubject} title="Uploads by Subject" color="#2563eb" />
              <SimpleBarChart data={charts.bySemester} title="Uploads by Semester" color="#7c3aed" />
            </div>

            <h2 className="text-lg font-semibold text-slate-800 mb-4">User Statistics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SimpleBarChart data={charts.topUploaders} title="Most Active Uploaders" color="#059669" />
            </div>

            <h2 className="text-lg font-semibold text-slate-800 mb-4">Engagement Statistics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SimpleBarChart data={charts.mostDownloaded} title="Most Downloaded Resources" color="#0891b2" />
              <SimpleBarChart data={charts.mostBookmarked} title="Most Bookmarked Resources" color="#d97706" />
            </div>

            <h2 className="text-lg font-semibold text-slate-800 mb-4">Monthly Growth</h2>
            <MultiBarChart data={charts.monthlyGrowth} title="Uploads & Registrations per Month" />
          </>
        )}
      </div>
    </div>
  );
}
