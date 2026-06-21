import { useState } from "react";
import { formatDate } from "../lib/resourceUtils";
import { canAccessResourceFile, canBookmarkResource } from "../lib/roles";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";
import StatusBadge from "./StatusBadge";

const CATEGORY_COLORS = {
  Notes: "bg-blue-100 text-blue-700",
  "Question Paper": "bg-purple-100 text-purple-700",
  Assignment: "bg-amber-100 text-amber-700",
  "Lab Manual": "bg-emerald-100 text-emerald-700",
  Other: "bg-slate-100 text-slate-700",
};

export default function ResourceCard({
  resource,
  isBookmarked = false,
  onBookmarkToggle,
  showBookmark = true,
}) {
  const { currentUser } = useAuth();
  const { role } = useRole();
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const badgeClass = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.Other;

  const canAccess = canAccessResourceFile(resource, currentUser?.uid, role);
  const canBookmark = canBookmarkResource(resource, currentUser?.uid, role) && showBookmark;

  async function handleBookmark() {
    if (!onBookmarkToggle || !canBookmark) return;
    setBookmarkLoading(true);
    try {
      await onBookmarkToggle(resource.id);
    } finally {
      setBookmarkLoading(false);
    }
  }

  return (
    <article className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
              {resource.category}
            </span>
            <StatusBadge status={resource.status} />
          </div>
          {canBookmark && onBookmarkToggle && (
            <button
              type="button"
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              title={isBookmarked ? "Remove bookmark" : "Save bookmark"}
              className={`text-xl leading-none transition-colors disabled:opacity-50 ${
                isBookmarked ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
              }`}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {isBookmarked ? "★" : "☆"}
            </button>
          )}
        </div>

        <h4 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{resource.title}</h4>

        <div className="space-y-1 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-700">Subject:</span> {resource.subject}
          </p>
          <p>
            <span className="font-medium text-slate-700">Semester:</span> {resource.semester}
          </p>
          <p className="text-xs text-slate-400 pt-1">
            By {resource.uploader} · {formatDate(resource.createdAt)}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 flex gap-2">
        {canAccess ? (
          <>
            <a
              href={resource.fileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-lg border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              View
            </a>
            <a
              href={resource.fileURL}
              download
              className="flex-1 text-center py-2.5 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Download
            </a>
          </>
        ) : (
          <p className="flex-1 text-center py-2.5 text-sm text-slate-400 bg-slate-50 rounded-lg">
            Awaiting approval
          </p>
        )}
      </div>
    </article>
  );
}
