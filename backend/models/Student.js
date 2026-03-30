import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    photoUrl: { type: String },
    standard: { type: String },
    branch: {
      type: String,
      enum: ["Diva", "Bhandup"],
      default: "Diva",
    },
    batchYear: { type: Number },
    photoPosition: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
  },
  { timestamps: true }
);

export const createStudentModel = (connection) => {
  if (connection.models.Student) {
    return connection.models.Student;
  }
  return connection.model("Student", StudentSchema);
};

export default createStudentModel;
