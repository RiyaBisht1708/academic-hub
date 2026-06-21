import { useState } from "react";
import { formatDate, formatRating } from "../lib/resourceUtils";
import { canAccessResourceFile, canBookmarkResource } from "../lib/roles";
import { trackDownload } from "../lib/activity";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";
import StatusBadge from "./StatusBadge";
import StarRating from "./StarRating";
import ResourceReviewsModal from "./ResourceReviewsModal";
import ResourceVersionsModal from "./ResourceVersionsModal";

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
  onResourceUpdate,
  showBookmark = true,
}) {
  const { currentUser } = useAuth();
  const { role } = useRole();
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  const badgeClass = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.Other;
  const canAccess = canAccessResourceFile(resource, currentUser?.uid, role);
  const canBookmark = canBookmarkResource(resource, currentUser?.uid, role) && showBookmark;

  async function handleBookmark() {
    if (!onBookmarkToggle || !canBookmark) return;
    setBookmarkLoading(true);
    try {
      await onBookmarkToggle(resource.id, resource.title);
    } finally {
      setBookmarkLoading(false);
    }
  }

  return (
    <>
      <article className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                {resource.category}
              </span>
              <StatusBadge status={resource.status} />
              {resource.currentVersion > 1 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  v{resource.currentVersion}
                </span>
              )}
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
              >
                {isBookmarked ? "★" : "☆"}
              </button>
            )}
          </div>

          <h4 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{resource.title}</h4>

          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={resource.averageRating} size="sm" />
            <span className="text-xs text-slate-500">
              {formatRating(resource.averageRating)}
              {resource.reviewCount > 0 ? (
                <span> ({resource.reviewCount} review{resource.reviewCount !== 1 ? "s" : ""})</span>
              ) : (
                <span> · No reviews yet</span>
              )}
            </span>
          </div>

          <div className="space-y-1 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-700">Subject:</span> {resource.subject}
            </p>
            <p>
              <span className="font-medium text-slate-700">Semester:</span> {resource.semester}
            </p>
            <p className="text-xs text-slate-400 pt-1">
              By {resource.uploader} · {formatDate(resource.createdAt)}
              {resource.downloadCount > 0 && (
                <span> · {resource.downloadCount} downloads</span>
              )}
            </p>
          </div>
        </div>

        <div className="px-5 pb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setShowReviews(true)}
            className="flex-1 text-center py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
          >
            Reviews
          </button>
          <button
            type="button"
            onClick={() => setShowVersions(true)}
            className="flex-1 text-center py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
          >
            Versions
          </button>
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
              <button
                type="button"
                disabled={downloading}
                onClick={async () => {
                  setDownloading(true);
                  try {
                    await trackDownload(resource.id);
                    window.open(resource.fileURL, "_blank");
                  } catch {
                    window.open(resource.fileURL, "_blank");
                  } finally {
                    setDownloading(false);
                  }
                }}
                className="flex-1 text-center py-2.5 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {downloading ? "..." : "Download"}
              </button>
            </>
          ) : (
            <p className="flex-1 text-center py-2.5 text-sm text-slate-400 bg-slate-50 rounded-lg">
              Awaiting approval
            </p>
          )}
        </div>
      </article>

      {showReviews && (
        <ResourceReviewsModal
          resource={resource}
          onClose={() => setShowReviews(false)}
          onReviewChange={() => onResourceUpdate?.()}
        />
      )}

      {showVersions && (
        <ResourceVersionsModal
          resource={resource}
          onClose={() => setShowVersions(false)}
          onUpdated={() => onResourceUpdate?.()}
        />
      )}
    </>
  );
}
