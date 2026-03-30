import mongoose from "mongoose";

const LeaderboardEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    standard: { type: String },
    branch: {
      type: String,
      enum: ["Diva", "Bhandup"],
      default: "Diva",
    },
    category: { type: String },
    score: { type: Number, required: true },
    photoUrl: { type: String },
    photoPosition: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
    year: { type: Number, default: new Date().getFullYear() },
    rank: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export const createLeaderboardEntryModel = (connection) => {
  if (connection.models.LeaderboardEntry) {
    return connection.models.LeaderboardEntry;
  }
  return connection.model("LeaderboardEntry", LeaderboardEntrySchema);
};

export default createLeaderboardEntryModel;
