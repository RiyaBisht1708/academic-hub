import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import UploadForm from "../components/UploadForm";
import ResourceCard from "../components/ResourceCard";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function mapResource(row) {
  return {
    id: row.id,
    title: row.title,
    semester: row.semester,
    subject: row.subject,
    category: row.category,
    fileURL: row.file_url,
    uploader: row.uploader,
    uploaderId: row.uploader_id,
    createdAt: row.created_at,
  };
}

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [semesterFilter, setSemesterFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

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

  const filtered = resources.filter((r) => {
    const matchSemester = semesterFilter ? String(r.semester) === String(semesterFilter) : true;
    const matchSubject = subjectFilter
      ? r.subject.toLowerCase().includes(subjectFilter.toLowerCase())
      : true;
    return matchSemester && matchSubject;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <UploadForm onUploaded={fetchResources} />

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>{`Semester ${s}`}</option>
            ))}
          </select>
          <input
            placeholder="Filter by subject..."
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
        </div>

        {loading && <p className="text-gray-600">Loading resources...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-600">No resources found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
