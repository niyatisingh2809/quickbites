import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import {
  createTicket,
  getCustomerTickets,
  getTicketDetails,
  replyToTicket,
  updateTicketStatus,
  reopenTicket,
  listAdminTickets,
  processTicketRefund
} from "../controllers/supportController.js";

const supportRouter = express.Router();

// Memory multer for support ticket photo evidence
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per photo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image attachments (JPEG, PNG, WebP) are allowed."), false);
    }
  }
});

// 1. Customer endpoints
supportRouter.post("/create", authMiddleware, upload.array("images", 4), createTicket);
supportRouter.get("/my-tickets", authMiddleware, getCustomerTickets);
supportRouter.get("/ticket/:ticketId", authMiddleware, getTicketDetails);
supportRouter.post("/ticket/:ticketId/reply", authMiddleware, replyToTicket);
supportRouter.post("/ticket/:ticketId/reopen", authMiddleware, reopenTicket);

// 2. Kitchen & Admin endpoints
supportRouter.patch(
  "/ticket/:ticketId/status",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  updateTicketStatus
);

supportRouter.get(
  "/admin/list",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  listAdminTickets
);

// 3. Platform Admin Only: Financial refunds
supportRouter.post(
  "/admin/refund",
  authMiddleware,
  authorizeRoles("admin"),
  processTicketRefund
);

export default supportRouter;
