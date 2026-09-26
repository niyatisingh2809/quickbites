import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("⚠️  [Database] MONGO_URI is not defined in .env. Please set your MongoDB Atlas connection string.");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("✅ [Database] MongoDB Connected successfully");
  } catch (error) {
    console.error("❌ [Database] MongoDB Connection Failed:", error.message);
  }
};
