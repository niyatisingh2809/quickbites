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

// Database connection
connectDB();

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

app.get("/", (req, res) => {
  res.json({ success: true, message: "Food Delivery API & Socket.IO server is running" });
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