export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function mapResource(row) {
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

export function filterResources(resources, { title = "", subject = "", semester = "" }) {
  const titleQuery = title.trim().toLowerCase();
  const subjectQuery = subject.trim().toLowerCase();

  return resources.filter((resource) => {
    const matchTitle = titleQuery
      ? resource.title.toLowerCase().includes(titleQuery)
      : true;
    const matchSubject = subjectQuery
      ? resource.subject.toLowerCase().includes(subjectQuery)
      : true;
    const matchSemester = semester
      ? String(resource.semester) === String(semester)
      : true;
    return matchTitle && matchSubject && matchSemester;
  });
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
