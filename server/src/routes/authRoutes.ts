import express from "express";
import passport from "passport";
import "../config/passport";
import { getProfile, login, register } from "../controllers/userController";

const router = express.Router();
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  getProfile,
);
router.post("/login", login);
router.post("/register", register);

export default router;
