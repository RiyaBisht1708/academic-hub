import { SEMESTERS } from "../lib/resourceUtils";

export default function ResourceSearch({
  title,
  subject,
  semester,
  onTitleChange,
  onSubjectChange,
  onSemesterChange,
  resultCount,
  totalCount,
}) {
  const hasFilters = title || subject || semester;

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 md:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Search Resources</h3>
        <p className="text-sm text-slate-500">
          {hasFilters
            ? `Showing ${resultCount} of ${totalCount} resources`
            : `${totalCount} resources available`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="search"
          placeholder="Search by title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="search"
          placeholder="Search by subject..."
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={semester}
          onChange={(e) => onSemesterChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>{`Semester ${s}`}</option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            onTitleChange("");
            onSubjectChange("");
            onSemesterChange("");
          }}
          className="mt-3 text-sm text-blue-700 font-medium hover:text-blue-800"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
