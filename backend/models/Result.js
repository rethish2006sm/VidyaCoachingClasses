import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    standard: { type: String },
    board: { type: String },
    year: { type: Number },
    percentage: { type: Number },
    marks: { type: Number },
    school: { type: String },
    rank: { type: Number },
    outOf: { type: Number, default: 500 },
    profileImage: { type: String },
    profileImagePosition: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
    subjects: {
      type: [
        {
          subject: { type: String },
          mark: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    notes: { type: String },
    showOnHome: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const createResultModel = (connection) => {
  if (connection.models.Result) return connection.models.Result;
  return connection.model("Result", ResultSchema);
};

export default createResultModel;
