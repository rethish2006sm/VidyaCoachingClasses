import mongoose from "mongoose";

const GalleryImageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Campus" },
    imageUrl: { type: String, required: true },
    description: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const createGalleryImageModel = (connection) => {
  if (connection.models.GalleryImage) {
    return connection.models.GalleryImage;
  }
  return connection.model("GalleryImage", GalleryImageSchema);
};

export default createGalleryImageModel;
