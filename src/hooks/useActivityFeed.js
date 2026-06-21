import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";

export function useActivityFeed(limit = 10) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error) setActivities(data || []);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, refresh: fetchActivities };
}
