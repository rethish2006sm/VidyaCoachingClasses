import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    faculty: { type: String, required: true },
    branches: {
      type: [String],
      enum: ["Diva", "Bhandup"],
      default: ["Diva", "Bhandup"],
    },
  },
  { timestamps: true }
);

export const createSubjectModel = (connection) => {
  if (connection.models.Subject) {
    return connection.models.Subject;
  }
  return connection.model("Subject", SubjectSchema);
};

export default createSubjectModel;
