import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createGroupOrder,
  getGroupOrderDetails,
  updateMemberSelection,
  lockGroupOrder,
  checkoutGroupOrder
} from "../controllers/groupOrderController.js";

const groupOrderRouter = express.Router();

const optionalAuth = (req, res, next) => {
  let token = req.headers.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();
  authMiddleware(req, res, next);
};

groupOrderRouter.post("/create", authMiddleware, createGroupOrder);
groupOrderRouter.get("/:inviteCode", optionalAuth, getGroupOrderDetails);
groupOrderRouter.post("/:inviteCode/items", authMiddleware, updateMemberSelection);
groupOrderRouter.post("/:inviteCode/lock", authMiddleware, lockGroupOrder);
groupOrderRouter.post("/:inviteCode/checkout", authMiddleware, checkoutGroupOrder);

export default groupOrderRouter;
