import { formatActivityMessage, getActivityIcon, timeAgo } from "../lib/activity";

export default function ActivityFeed({ activities, loading, title = "Recent Activity", emptyMessage }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>

      {loading && <p className="text-slate-500 text-sm">Loading activity...</p>}

      {!loading && activities.length === 0 && (
        <p className="text-slate-500 text-sm">{emptyMessage || "No recent activity yet."}</p>
      )}

      {!loading && activities.length > 0 && (
        <ul className="space-y-3">
          {activities.map((log) => (
            <li
              key={log.id}
              className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0"
            >
              <span className="text-lg shrink-0 mt-0.5">{getActivityIcon(log.action_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{formatActivityMessage(log)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{timeAgo(log.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
