import { RESOURCE_STATUS } from "../lib/roles";

const STATUS_STYLES = {
  [RESOURCE_STATUS.PENDING]: "bg-amber-100 text-amber-800 border-amber-200",
  [RESOURCE_STATUS.APPROVED]: "bg-emerald-100 text-emerald-800 border-emerald-200",
  [RESOURCE_STATUS.REJECTED]: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS = {
  [RESOURCE_STATUS.PENDING]: "🟡 Pending",
  [RESOURCE_STATUS.APPROVED]: "🟢 Approved",
  [RESOURCE_STATUS.REJECTED]: "🔴 Rejected",
};

export default function StatusBadge({ status, className = "" }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES[RESOURCE_STATUS.PENDING];
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${style} ${className}`}
    >
      {label}
    </span>
  );
}
