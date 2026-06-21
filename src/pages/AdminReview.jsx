import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { formatDate, mapResource } from "../lib/resourceUtils";
import { RESOURCE_STATUS } from "../lib/roles";
import { logActivity } from "../lib/activity";

const TABS = ["Pending", "Approved", "Rejected", "All"];

export default function AdminReview() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");
  const [actionId, setActionId] = useState(null);

  async function fetchResources() {
    setLoading(true);
    setError("");
    try {
      const { data, error: fetchError } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setResources((data || []).map(mapResource));
    } catch (err) {
      setError("Failed to load resources: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResources();
  }, []);

  const displayed = resources.filter((r) => {
    if (activeTab === "All") return true;
    return r.status === activeTab;
  });

  async function updateStatus(id, status) {
    setActionId(id);
    setError("");
    try {
      const resource = resources.find((r) => r.id === id);
      const { error: updateError } = await supabase
        .from("resources")
        .update({ status })
        .eq("id", id);
      if (updateError) throw updateError;

      if (status === RESOURCE_STATUS.APPROVED) {
        await logActivity("approve", id, resource?.title);
      } else if (status === RESOURCE_STATUS.REJECTED) {
        await logActivity("reject", id, resource?.title);
      }

      await fetchResources();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function deleteResource(id) {
    if (!window.confirm("Delete this resource permanently?")) return;

    setActionId(id);
    setError("");
    try {
      const { error: deleteError } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      await fetchResources();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Admin Review Panel</h1>
          <p className="text-slate-500 mt-1">Approve, reject, or delete uploaded resources</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-700 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-1.5 opacity-80">
                  ({resources.filter((r) => r.status === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        {loading && <p className="text-slate-600">Loading resources...</p>}

        {!loading && displayed.length === 0 && (
          <p className="text-slate-600">No {activeTab.toLowerCase()} resources found.</p>
        )}

        {!loading && displayed.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden md:table-cell">Uploader</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden sm:table-cell">Subject</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Semester</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden lg:table-cell">Uploaded</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayed.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{resource.title}</td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{resource.uploader}</td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{resource.subject}</td>
                      <td className="px-4 py-3 text-slate-600">{resource.semester}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                        {formatDate(resource.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={resource.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {resource.status !== RESOURCE_STATUS.APPROVED && (
                            <button
                              type="button"
                              disabled={actionId === resource.id}
                              onClick={() => updateStatus(resource.id, RESOURCE_STATUS.APPROVED)}
                              className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {resource.status !== RESOURCE_STATUS.REJECTED && (
                            <button
                              type="button"
                              disabled={actionId === resource.id}
                              onClick={() => updateStatus(resource.id, RESOURCE_STATUS.REJECTED)}
                              className="px-3 py-1 rounded-md bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={actionId === resource.id}
                            onClick={() => deleteResource(resource.id)}
                            className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
