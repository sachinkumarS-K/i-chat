import express from "express";
import {
  allUsers,
  loginUser,
  registerUser,
} from "../controller/userController.js";
import { upload } from "../middleware/multer.middleware.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", upload.single("pic"), registerUser);
router.route("/").get(auth, allUsers);

export default router;
