import mongoose from "mongoose";

const createConnection = async (uri, label) => {
  if (!uri) {
    throw new Error(`${label} connection string is missing.`);
  }
  const connection = mongoose.createConnection(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 6000,
  });
  await connection.asPromise();
  console.log(`Connected to ${label} database.`);
  return connection;
};

export const connectDatabases = async () => {
  const mainUri = process.env.MONGO_URL || process.env.MONGO_URI;
  const galleryUri =
    process.env.MONGO_GALLERY_URL || process.env.MONGO_GALLERY_URI;
  const userUri = process.env.MONGO_USER_URL || process.env.MONGO_USER_URI;

  if (!mainUri) {
    throw new Error("MONGO_URL (or MONGO_URI) is required.");
  }
  if (!galleryUri) {
    throw new Error("MONGO_GALLERY_URL is required.");
  }
  if (!userUri) {
    throw new Error("MONGO_USER_URL is required.");
  }

  const [mainDb, galleryDb, userDb] = await Promise.all([
    createConnection(mainUri, "main"),
    createConnection(galleryUri, "gallery"),
    createConnection(userUri, "user"),
  ]);

  return { mainDb, galleryDb, userDb };
};
