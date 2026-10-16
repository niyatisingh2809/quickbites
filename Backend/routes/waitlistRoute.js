import express from "express";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import { joinWaitlist, getWaitlistSummary } from "../controllers/waitlistController.js";

const waitlistRouter = express.Router();

// Optional auth helper: if user token is present, decode it; otherwise continue unauthenticated
const optionalAuth = (req, res, next) => {
  let token = req.headers.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();
  authMiddleware(req, res, next);
};

// Customer join waitlist
waitlistRouter.post("/join", optionalAuth, joinWaitlist);

// Admin demand summary
waitlistRouter.get("/summary", authMiddleware, authorizeRoles("admin"), getWaitlistSummary);

export default waitlistRouter;
