export function countByField(items, field) {
  const counts = {};
  for (const item of items) {
    const key = item[field] ?? "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name: String(name), value }))
    .sort((a, b) => b.value - a.value);
}

export function countByMonth(items, dateField) {
  const counts = {};
  for (const item of items) {
    if (!item[dateField]) continue;
    const d = new Date(item[dateField]);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .slice(-6);
}

export function topUploaders(resources, limit = 5) {
  const counts = {};
  for (const r of resources) {
    const name = r.uploader || "Unknown";
    counts[name] = (counts[name] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function topByField(items, field, limit = 5) {
  return [...items]
    .sort((a, b) => (b[field] || 0) - (a[field] || 0))
    .slice(0, limit)
    .map((item) => ({
      name: item.title?.length > 20 ? item.title.slice(0, 20) + "…" : item.title,
      value: item[field] || 0,
    }));
}

export function countBookmarkedResources(bookmarks, resources) {
  const counts = {};
  for (const b of bookmarks) {
    counts[b.resource_id] = (counts[b.resource_id] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([id, value]) => {
      const resource = resources.find((r) => r.id === id);
      return {
        name: resource?.title?.length > 20
          ? resource.title.slice(0, 20) + "…"
          : resource?.title || "Unknown",
        value,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function bookmarkCountByUser(bookmarks) {
  const counts = {};
  for (const b of bookmarks) {
    counts[b.user_id] = (counts[b.user_id] || 0) + 1;
  }
  return counts;
}
