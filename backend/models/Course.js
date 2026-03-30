import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    section: {
      type: String,
      enum: ["Primary", "Secondary", "Foundation", "Competitive"],
      default: "Primary",
    },
    board: { type: String, default: "State" },
    branch: {
      type: String,
      enum: ["Diva", "Bhandup"],
      default: "Diva",
    },
    description: { type: String },
    fee: { type: String },
    timings: { type: String },
    duration: { type: String },
    grade: { type: String },
    days: [{ type: String }],
    highlights: [{ type: String }],
    additionalDetails: [{ type: String }],
    subjects: [
      {
        name: String,
        faculty: String,
      },
    ],
  showOnHome: { type: Boolean, default: false },
  visibility: {
    type: String,
    enum: ["home", "course", "both"],
    default: "both",
  },
  metadata: mongoose.Schema.Types.Mixed,
  courseType: {
    type: String,
    enum: ["individual", "combo"],
    default: "individual",
  },
  grades: [{ type: String }],
},
{ timestamps: true }
);

export const createCourseModel = (connection) => {
  if (connection.models.Course) {
    return connection.models.Course;
  }
  return connection.model("Course", CourseSchema);
};

export default createCourseModel;
