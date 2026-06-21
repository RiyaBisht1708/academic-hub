export default function ResourceCard({ resource }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
      <div>
        <h4 className="font-bold text-blue-700 mb-1">{resource.title}</h4>
        <p className="text-sm text-gray-600">Subject: {resource.subject}</p>
        <p className="text-sm text-gray-600">Semester: {resource.semester}</p>
        <p className="text-sm text-gray-600">Category: {resource.category}</p>
        <p className="text-xs text-gray-400 mt-1">Uploaded by {resource.uploader}</p>
      </div>
      <a
        href={resource.fileURL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 bg-blue-700 text-white text-center py-2 rounded font-medium hover:bg-blue-800"
      >
        Download PDF
      </a>
    </div>
  );
}
