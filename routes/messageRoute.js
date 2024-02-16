import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allMessages, sendMessage } from "../controller/messageController.js";

const router = express.Router();

router.route("/").post(auth, sendMessage);
router.route("/:chatId").get(auth, allMessages);

export default router;
