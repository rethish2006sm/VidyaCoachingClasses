import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    applyingFor: { type: String, default: "" },
    course: { type: String, default: "" },
    learningGoals: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const createInquiryModel = (connection) => {
  if (connection.models.Inquiry) {
    return connection.models.Inquiry;
  }
  return connection.model("Inquiry", inquirySchema);
};

export default createInquiryModel;
