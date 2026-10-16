import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import restaurantRouter from "./routes/restaurantRoute.js";
import deliveryPartnerRouter from "./routes/deliveryPartnerRoute.js";
import thaliRouter from "./routes/thaliRoute.js";
import mealPickerRouter from "./routes/mealPickerRoute.js";
import supportRouter from "./routes/supportRoute.js";
import analyticsRouter from "./routes/analyticsRoute.js";
import waitlistRouter from "./routes/waitlistRoute.js";
import budgetMealRouter from "./routes/budgetMealRoute.js";
import groupOrderRouter from "./routes/groupOrderRoute.js";
import tiffinRouter from "./routes/tiffinRoute.js";
import { startTiffinScheduler } from "./services/tiffinScheduler.js";
import { runInitialMigrations } from "./config/migration.js";

// App & HTTP server config
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// Initialize Socket.IO Real-Time Engine
initSocket(server);

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

// General Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api", apiLimiter);

// Database connection & migrations (synced with unique dish images)
connectDB().then(() => {
  runInitialMigrations();
  startTiffinScheduler();
});

// Static asset delivery for uploads with Cloudinary redirect support
app.use("/images", (req, res, next) => {
  let targetPath = req.url.startsWith("/") ? req.url.slice(1) : req.url;
  try {
    targetPath = decodeURIComponent(targetPath);
  } catch (e) {}

  if (targetPath.startsWith("http://") || targetPath.startsWith("https://")) {
    return res.redirect(targetPath);
  }
  express.static("uploads")(req, res, next);
});

// API endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/delivery", deliveryPartnerRouter);
app.use("/api/thali", thaliRouter);
app.use("/api/meal-picker", mealPickerRouter);
app.use("/api/support", supportRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/waitlist", waitlistRouter);
app.use("/api/budget-meal", budgetMealRouter);
app.use("/api/group-order", groupOrderRouter);
app.use("/api/tiffin", tiffinRouter);

app.get("/", (req, res) => {
  res.json({ success: true, message: "QuickBites API v2.0 — Live & Running 🚀", version: "2.0.0" });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

server.listen(port, () => {
  console.log(`🚀 Server & Socket.IO started on http://localhost:${port}`);
});