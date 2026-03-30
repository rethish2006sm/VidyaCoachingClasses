import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import createApiRouter from "./routes/api.js";
import { connectDatabases } from "./lib/connections.js";
import { createCourseModel } from "./models/Course.js";
import { createResultModel } from "./models/Result.js";
import { createLeaderboardEntryModel } from "./models/LeaderboardEntry.js";
import { createGalleryImageModel } from "./models/GalleryImage.js";
import { createOfferImageModel } from "./models/OfferImage.js";
import { createSubjectModel } from "./models/Subject.js";
import { createStudentModel } from "./models/Student.js";
import { createInquiryModel } from "./models/Inquiry.js";

dotenv.config();

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "*";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.send("Vidya Coaching backend is up.");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connections = await connectDatabases();
    const models = {
      Course: createCourseModel(connections.mainDb),
      Result: createResultModel(connections.mainDb),
      LeaderboardEntry: createLeaderboardEntryModel(connections.mainDb),
      OfferImage: createOfferImageModel(connections.mainDb),
      Inquiry: createInquiryModel(connections.mainDb),
      GalleryImage: createGalleryImageModel(connections.galleryDb),
      Student: createStudentModel(connections.userDb),
      Subject: createSubjectModel(connections.userDb),
    };
    app.use("/api", createApiRouter(models));
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database setup failed:", error.message);
    process.exit(1);
  }
};

startServer();
