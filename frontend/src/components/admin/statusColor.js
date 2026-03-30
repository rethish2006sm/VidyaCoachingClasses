const statusColor = (text) => {
  if (!text) return "text-slate-500";
  const normalized = text.toLowerCase();
  if (
    normalized.includes("success") ||
    normalized.includes("added") ||
    normalized.includes("saved")
  )
    return "text-emerald-600";
  return "text-red-600";
};

export default statusColor;
