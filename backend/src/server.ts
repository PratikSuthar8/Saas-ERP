import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

// Load environment file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "dev"}`;
dotenv.config({ path: envFile });

console.log(`🚀 Starting server in ${process.env.NODE_ENV || "development"} mode`);
console.log(`📁 Loading environment from: ${envFile}`);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ DB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
