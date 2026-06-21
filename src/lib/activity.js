import { supabase } from "../supabase";

export async function logActivity(actionType, resourceId = null, resourceTitle = null) {
  const { error } = await supabase.rpc("log_activity", {
    p_action_type: actionType,
    p_resource_id: resourceId,
    p_resource_title: resourceTitle,
  });
  if (error) console.warn("Activity log failed:", error.message);
}

export async function trackDownload(resourceId) {
  const { error } = await supabase.rpc("track_download", {
    p_resource_id: resourceId,
  });
  if (error) throw error;
}

export function formatActivityMessage(log) {
  const title = log.resource_title || "a resource";
  switch (log.action_type) {
    case "upload":
      return `${log.actor_name} uploaded ${title}`;
    case "approve":
      return `${log.actor_name} approved ${title}`;
    case "reject":
      return `${log.actor_name} rejected ${title}`;
    case "bookmark":
      return `${log.actor_name} bookmarked ${title}`;
    case "download":
      return `${log.actor_name} downloaded ${title}`;
    default:
      return `${log.actor_name} performed an action`;
  }
}

export function getActivityIcon(actionType) {
  switch (actionType) {
    case "upload":
      return "📤";
    case "approve":
      return "✅";
    case "reject":
      return "❌";
    case "bookmark":
      return "⭐";
    case "download":
      return "⬇️";
    default:
      return "•";
  }
}

export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
