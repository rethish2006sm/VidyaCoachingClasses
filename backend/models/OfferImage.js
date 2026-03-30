import mongoose from "mongoose";

const OfferImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    caption: { type: String, trim: true },
    link: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const createOfferImageModel = (connection) => {
  if (connection.models.OfferImage) {
    return connection.models.OfferImage;
  }
  return connection.model("OfferImage", OfferImageSchema);
};

export default createOfferImageModel;
