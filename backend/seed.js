import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "./models/Course.js";
import Result from "./models/Result.js";
import LeaderboardEntry from "./models/LeaderboardEntry.js";
import GalleryImage from "./models/GalleryImage.js";
import Subject from "./models/Subject.js";

dotenv.config();

const sampleSubjects = [
  { name: "Mathematics", faculty: "Ms. Kavita Rao" },
  { name: "Science", faculty: "Mr. Harsh Gupta" },
  { name: "English", faculty: "Ms. Nisha Desai" },
  { name: "Mathematics", faculty: "Mr. Arjun Iyer" },
  { name: "Science", faculty: "Ms. Deepa Nambiar" },
];

const sampleCourses = [
  {
    title: "SSC Master Batch",
    section: "Secondary",
    board: "State",
    branch: "Diva",
    fee: "₹21,000 / month",
    timings: "Mon-Fri • 6:30 PM - 9:30 PM",
    duration: "6 months",
    description: "Board and Olympiad aligned classroom with weekly diagnostics.",
    grade: "Standard 10",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    highlights: ["Adaptive mocks", "Doubt cells", "Parent analytics"],
    subjects: [
      { name: "Mathematics", faculty: "Ms. Kavita Rao" },
      { name: "Science", faculty: "Mr. Harsh Gupta" },
      { name: "English", faculty: "Ms. Nisha Desai" },
    ],
    visibility: "both",
    showOnHome: true,
  },
  {
    title: "Class IX Precision",
    section: "Secondary",
    board: "State",
    branch: "Diva",
    fee: "₹19,500 / month",
    timings: "Mon-Fri • 5:00 PM - 8:00 PM",
    duration: "6 months",
    description: "Concept clarity + weekly challenge solves.",
    grade: "Standard 9",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    highlights: ["Mini-mock Fridays", "Mentor clinics"],
    subjects: [
      { name: "Mathematics", faculty: "Mr. Arjun Iyer" },
      { name: "Science", faculty: "Ms. Deepa Nambiar" },
    ],
    visibility: "both",
    showOnHome: true,
  },
];

const sampleResultSubjectsA = [
  { subject: "Maths", mark: 98 },
  { subject: "Science", mark: 95 },
  { subject: "English", mark: 96 },
  { subject: "S.S.", mark: 94 },
  { subject: "Comp", mark: 97 },
  { subject: "Hindi", mark: 92 },
];

const sampleResultSubjectsB = [
  { subject: "Maths", mark: 97 },
  { subject: "Science", mark: 96 },
  { subject: "English", mark: 95 },
  { subject: "S.S.", mark: 93 },
  { subject: "Comp", mark: 96 },
  { subject: "Hindi", mark: 94 },
];

const sampleResults = [
  {
    studentName: "Riya Patil",
    standard: "SSC",
    board: "State",
    year: 2026,
    percentage: 97.4,
    marks: 582,
    rank: 1,
    notes: "All subject distinction",
    showOnHome: true,
    subjects: sampleResultSubjectsA,
  },
  {
    studentName: "Devansh Rao",
    standard: "Class IX",
    board: "State",
    year: 2026,
    percentage: 96.2,
    marks: 576,
    rank: 1,
    notes: "State toppers cohort",
    showOnHome: true,
    subjects: sampleResultSubjectsB,
  },
];

const sampleLeaderboard = [
  {
    name: "Anaya Bose",
    standard: "Class IX",
    category: "IX Board",
    score: 98,
    rank: 1,
    year: 2026,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    photoPosition: { x: 50, y: 40 },
    notes: "Olympiad scholar",
  },
  {
    name: "Vira Kapoor",
    standard: "SSC",
    category: "SSC Board",
    score: 96,
    rank: 2,
    year: 2026,
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    photoPosition: { x: 45, y: 60 },
    notes: "Top percentile",
  },
];

const sampleGallery = [
  {
    title: "Interactive Lab Sessions",
    category: "Campus",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    description: "Hands-on lab practice keeps the cohort curious.",
  },
  {
    title: "Community Learning Space",
    category: "Campus",
    imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70",
    description: "Collaborative clubs and doubt solving happen in this zone.",
  },
];

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "vidya_coaching",
    });

    console.log("Connected to MongoDB. Seeding data...");

    await Promise.all([
    Course.deleteMany(),
    Result.deleteMany(),
    LeaderboardEntry.deleteMany(),
    GalleryImage.deleteMany(),
    Subject.deleteMany(),
    ]);

    await Course.create(sampleCourses);
    await Result.create(sampleResults);
    await LeaderboardEntry.create(sampleLeaderboard);
    await GalleryImage.create(sampleGallery);
    await Subject.create(sampleSubjects);

    console.log("Seeding completed. Closing connection...");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
