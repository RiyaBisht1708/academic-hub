import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];

export default function SimpleBarChart({ data, title, color = COLORS[0] }) {
  if (!data?.length) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MultiBarChart({ data, title }) {
  if (!data?.length) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="uploads" fill="#2563eb" name="Uploads" radius={[4, 4, 0, 0]} />
          <Bar dataKey="users" fill="#7c3aed" name="Users" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
