import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../hooks/useBookmarks";
import Navbar from "../components/Navbar";
import ResourceCard from "../components/ResourceCard";
import ResourceSearch from "../components/ResourceSearch";
import { filterAndSortResources, mapResource, SORT_OPTIONS } from "../lib/resourceUtils";

export default function Bookmarks() {
  const { currentUser } = useAuth();
  const { isBookmarked, toggleBookmark, fetchBookmarks } = useBookmarks();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [titleFilter, setTitleFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [minDownloadsFilter, setMinDownloadsFilter] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);

  async function fetchBookmarkedResources() {
    if (!currentUser) return;

    setLoading(true);
    setError("");
    try {
      const { data, error: fetchError } = await supabase
        .from("bookmarks")
        .select("resource_id, resources(*)")
        .eq("user_id", currentUser.uid)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const items = (data || [])
        .map((row) => row.resources)
        .filter(Boolean)
        .map(mapResource);

      setResources(items);
    } catch (err) {
      setError("Failed to load bookmarks: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookmarkedResources();
  }, [currentUser]);

  async function handleBookmarkToggle(resourceId, resourceTitle) {
    await toggleBookmark(resourceId, resourceTitle);
    await fetchBookmarkedResources();
    await fetchBookmarks();
  }

  const filtered = filterAndSortResources(
    resources,
    {
      title: titleFilter,
      subject: subjectFilter,
      semester: semesterFilter,
      category: categoryFilter,
      minRating: minRatingFilter,
      minDownloads: minDownloadsFilter,
    },
    sortBy
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">My Bookmarks</h1>
          <p className="text-slate-500 mt-1">Resources you have saved for later</p>
        </div>

        <ResourceSearch
          title={titleFilter}
          subject={subjectFilter}
          semester={semesterFilter}
          category={categoryFilter}
          minRating={minRatingFilter}
          minDownloads={minDownloadsFilter}
          sortBy={sortBy}
          onTitleChange={setTitleFilter}
          onSubjectChange={setSubjectFilter}
          onSemesterChange={setSemesterFilter}
          onCategoryChange={setCategoryFilter}
          onMinRatingChange={setMinRatingFilter}
          onMinDownloadsChange={setMinDownloadsFilter}
          onSortChange={setSortBy}
          resultCount={filtered.length}
          totalCount={resources.length}
        />

        {loading && <p className="text-slate-600">Loading bookmarks...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && resources.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-10 text-center">
            <p className="text-slate-600 mb-4">You have not bookmarked any resources yet.</p>
            <Link
              to="/resources"
              className="inline-block bg-blue-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-800"
            >
              Browse Resources
            </Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isBookmarked={isBookmarked(resource.id)}
                onBookmarkToggle={handleBookmarkToggle}
                onResourceUpdate={fetchBookmarkedResources}
              />
            ))}
          </div>
        )}

        {!loading && resources.length > 0 && filtered.length === 0 && (
          <p className="text-slate-600">No bookmarks match your search.</p>
        )}
      </div>
    </div>
  );
}
