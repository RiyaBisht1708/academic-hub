export default function StatCard({ label, value, color = "text-blue-700", sublabel }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
}
