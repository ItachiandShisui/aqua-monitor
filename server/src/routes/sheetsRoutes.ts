import express from "express";
import {
  getHVSITPSheet,
  createHVSITPSheet,
  updateHVSITPSheet,
  getGVSSheet,
  createGVSSheet,
  updateGVSSheet,
  exportGVSCollection,
  exportHVSITPCollection,
} from "../controllers/sheetsController";

const router = express.Router();

router.get("/getHVSITPSheet", getHVSITPSheet);
router.post("/createHVSITPSheet", createHVSITPSheet);
router.patch("/updateHVSITPSheet", updateHVSITPSheet);
router.get("/getGVSSheet", getGVSSheet);
router.post("/createGVSSheet", createGVSSheet);
router.patch("/updateGVSSheet", updateGVSSheet);
router.get("/exportGVSCollection", exportGVSCollection);
router.get("/exportHVSITPCollection", exportHVSITPCollection);

export default router;
