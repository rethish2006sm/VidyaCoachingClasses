export const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const normalizeGalleryCategory = (category) => {
  if (typeof category !== "string") {
    return "General";
  }
  const normalized = category.trim();
  return normalized.length ? normalized : "General";
};

export const resolveGalleryImageId = (image) =>
  image?._id ?? image?.id ?? image?.imageUrl ?? image?.title ?? `${image?.category ?? "gallery"}-${Math.random()}`;

export const groupImagesByCategory = (images = []) => {
  const buckets = new Map();
  images.forEach((image) => {
    const name = normalizeGalleryCategory(image?.category);
    const bucket = buckets.get(name) || { name, images: [] };
    bucket.images.push(image);
    buckets.set(name, bucket);
  });
  const result = Array.from(buckets.values()).map((group) => {
    const sorted = [...group.images].sort((a, b) => {
      const aTime = new Date(a?.createdAt ?? 0).getTime();
      const bTime = new Date(b?.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
    return {
      name: group.name,
      images: sorted,
      count: sorted.length,
      coverImage: sorted[0],
      coverTitle: sorted[0]?.title || "Gallery",
    };
  });
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
};

export const groupGalleryImages = (items = []) => {
  const buckets = {};
  (Array.isArray(items) ? items : []).forEach((item) => {
    const category = (item.category || "General").trim() || "General";
    if (!buckets[category]) {
      buckets[category] = [];
    }
    buckets[category].push({
      id: item._id,
      title: item.title || "Gallery image",
      description: item.description,
      imageUrl: item.imageUrl,
      featured: Boolean(item.featured),
      uploadedAt: item.createdAt || item.updatedAt || item.uploadedAt,
    });
  });
  return Object.entries(buckets).map(([category, images]) => ({
    id: `server-${slugify(category) || "gallery"}`,
    name: category,
    category,
    description: images[0]?.description || "",
    images,
  }));
};
