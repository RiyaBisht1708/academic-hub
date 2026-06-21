import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useBookmarks } from "../hooks/useBookmarks";
import Navbar from "../components/Navbar";
import UploadForm from "../components/UploadForm";
import ResourceCard from "../components/ResourceCard";
import ResourceSearch from "../components/ResourceSearch";
import { filterAndSortResources, mapResource, SORT_OPTIONS } from "../lib/resourceUtils";

export default function Resources() {
  const { isBookmarked, toggleBookmark } = useBookmarks();
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
          <h1 className="text-2xl font-bold text-slate-800">Resources</h1>
          <p className="text-slate-500 mt-1">
            Upload, search, rate, and download academic materials. New uploads require admin approval.
          </p>
        </div>

        <UploadForm onUploaded={fetchResources} />

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

        {loading && <p className="text-slate-600">Loading resources...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && resources.length === 0 && (
          <p className="text-slate-600">No resources found. Be the first to upload!</p>
        )}
        {!loading && resources.length > 0 && filtered.length === 0 && (
          <p className="text-slate-600">No resources match your filters.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isBookmarked={isBookmarked(resource.id)}
              onBookmarkToggle={toggleBookmark}
              onResourceUpdate={fetchResources}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
