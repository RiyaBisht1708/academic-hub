export const CATEGORIES = ["Notes", "Question Paper", "Assignment", "Lab Manual", "Other"];

export const SORT_OPTIONS = {
  NEWEST: "newest",
  DOWNLOADS: "downloads",
  RATING: "rating",
};

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
    status: row.status || "Approved",
    downloadCount: row.download_count || 0,
    lastDownloadedAt: row.last_downloaded_at,
    currentVersion: row.current_version || 1,
    averageRating: Number(row.average_rating) || 0,
    reviewCount: row.review_count || 0,
    createdAt: row.created_at,
  };
}

export function mapReview(row) {
  return {
    id: row.id,
    resourceId: row.resource_id,
    userId: row.user_id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export function mapVersion(row) {
  return {
    id: row.id,
    resourceId: row.resource_id,
    versionNumber: row.version_number,
    fileURL: row.file_url,
    uploader: row.uploader,
    uploaderId: row.uploader_id,
    createdAt: row.created_at,
  };
}

export function filterAndSortResources(
  resources,
  {
    title = "",
    subject = "",
    semester = "",
    category = "",
    minRating = "",
    minDownloads = "",
  },
  sortBy = SORT_OPTIONS.NEWEST
) {
  const titleQuery = title.trim().toLowerCase();
  const subjectQuery = subject.trim().toLowerCase();
  const minRatingNum = minRating ? Number(minRating) : 0;
  const minDownloadsNum = minDownloads ? Number(minDownloads) : 0;

  let result = resources.filter((resource) => {
    const matchTitle = titleQuery
      ? resource.title.toLowerCase().includes(titleQuery)
      : true;
    const matchSubject = subjectQuery
      ? resource.subject.toLowerCase().includes(subjectQuery)
      : true;
    const matchSemester = semester
      ? String(resource.semester) === String(semester)
      : true;
    const matchCategory = category ? resource.category === category : true;
    const matchRating = resource.averageRating >= minRatingNum;
    const matchDownloads = resource.downloadCount >= minDownloadsNum;
    return (
      matchTitle &&
      matchSubject &&
      matchSemester &&
      matchCategory &&
      matchRating &&
      matchDownloads
    );
  });

  result = [...result].sort((a, b) => {
    if (sortBy === SORT_OPTIONS.DOWNLOADS) {
      return b.downloadCount - a.downloadCount;
    }
    if (sortBy === SORT_OPTIONS.RATING) {
      return b.averageRating - a.averageRating || b.reviewCount - a.reviewCount;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return result;
}

/** @deprecated use filterAndSortResources */
export function filterResources(resources, filters) {
  return filterAndSortResources(resources, filters, SORT_OPTIONS.NEWEST);
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}
