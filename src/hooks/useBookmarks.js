import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { logActivity } from "../lib/activity";

export function useBookmarks() {
  const { currentUser } = useAuth();
  const [bookmarkIds, setBookmarkIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!currentUser) {
      setBookmarkIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("bookmarks")
      .select("resource_id")
      .eq("user_id", currentUser.uid);

    if (!error) {
      setBookmarkIds(new Set((data || []).map((row) => row.resource_id)));
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback(
    (resourceId) => bookmarkIds.has(resourceId),
    [bookmarkIds]
  );

  async function toggleBookmark(resourceId, resourceTitle = null) {
    if (!currentUser) return false;

    if (bookmarkIds.has(resourceId)) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", currentUser.uid)
        .eq("resource_id", resourceId);

      if (error) throw error;

      setBookmarkIds((prev) => {
        const next = new Set(prev);
        next.delete(resourceId);
        return next;
      });
      return false;
    }

    const { error } = await supabase.from("bookmarks").insert({
      user_id: currentUser.uid,
      resource_id: resourceId,
    });

    if (error) throw error;

    await logActivity("bookmark", resourceId, resourceTitle);

    setBookmarkIds((prev) => new Set(prev).add(resourceId));
    return true;
  }

  return {
    bookmarkIds,
    bookmarkCount: bookmarkIds.size,
    loading,
    fetchBookmarks,
    isBookmarked,
    toggleBookmark,
  };
}
