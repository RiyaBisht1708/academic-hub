import { CATEGORIES, SEMESTERS, SORT_OPTIONS } from "../lib/resourceUtils";

const SORT_LABELS = {
  [SORT_OPTIONS.NEWEST]: "Newest",
  [SORT_OPTIONS.DOWNLOADS]: "Most Downloaded",
  [SORT_OPTIONS.RATING]: "Highest Rated",
};

export default function ResourceSearch({
  title,
  subject,
  semester,
  category,
  minRating,
  minDownloads,
  sortBy,
  onTitleChange,
  onSubjectChange,
  onSemesterChange,
  onCategoryChange,
  onMinRatingChange,
  onMinDownloadsChange,
  onSortChange,
  resultCount,
  totalCount,
}) {
  const hasFilters =
    title || subject || semester || category || minRating || minDownloads;

  function clearAll() {
    onTitleChange("");
    onSubjectChange("");
    onSemesterChange("");
    onCategoryChange("");
    onMinRatingChange("");
    onMinDownloadsChange("");
    onSortChange(SORT_OPTIONS.NEWEST);
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 md:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Search & Filter</h3>
        <p className="text-sm text-slate-500">
          {hasFilters
            ? `Showing ${resultCount} of ${totalCount} resources`
            : `${totalCount} resources available`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        <input
          type="search"
          placeholder="Search by title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="search"
          placeholder="Search by subject..."
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={semester}
          onChange={(e) => onSemesterChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>{`Semester ${s}`}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={minRating}
          onChange={(e) => onMinRatingChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any Rating</option>
          {[4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{`${r}+ stars`}</option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          placeholder="Min downloads"
          value={minDownloads}
          onChange={(e) => onMinDownloadsChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-blue-700 font-medium hover:text-blue-800"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
