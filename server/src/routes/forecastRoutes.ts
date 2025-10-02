import express from "express";
import {
  getHVSITPForecast,
  getGVSAnalyze,
  createHVSITPForecastSheet,
  createGVSAnalyze,
  updateHVSITPForecastSheet,
  updateGVSForecastSheet,
  exportHVSITPForecastCollection,
  exportGVSForecastCollection,
  getIncidents,
} from "../controllers/forecastController";

const router = express.Router();

router.post("/createHVSITPForecastSheet", createHVSITPForecastSheet);
router.post("/createGVSAnalyze", createGVSAnalyze);
router.get("/getGVSAnalyze", getGVSAnalyze);
router.patch("/updateHVSITPForecastSheet", updateHVSITPForecastSheet);
router.patch("/updateGVSForecastSheet", updateGVSForecastSheet);
router.get("/getHVSITPForecast", getHVSITPForecast);
router.get("/exportHVSITPForecastCollection", exportHVSITPForecastCollection);
router.get("/exportGVSForecastCollection", exportGVSForecastCollection);
router.get("/getIncidents", getIncidents);

export default router;
