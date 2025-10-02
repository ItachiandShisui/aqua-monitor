import express from "express";
import {
  getGVSAnalyze,
  createGVSAnalyze,
  updateGVSForecastSheet,
  getHVSITPForecast,
  exportGVSForecastCollection,
  getIncidents,
} from "../controllers/forecastController";

const router = express.Router();

router.post("/createGVSAnalyze", createGVSAnalyze);
router.get("/getGVSAnalyze", getGVSAnalyze);
router.patch("/updateGVSForecastSheet", updateGVSForecastSheet);
router.get("/getHVSITPForecast", getHVSITPForecast);
router.get("/exportGVSForecastCollection", exportGVSForecastCollection);
router.get("/getIncidents", getIncidents);

export default router;
