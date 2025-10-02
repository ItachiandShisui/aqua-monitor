import mongoose from "mongoose";
import type { IHVSITPForecast } from "../types/sheets";

const HVSITPForecastSchema = new mongoose.Schema<IHVSITPForecast>({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
  },
  datetime: {
    type: Date,
    required: true,
  },
  maintenance: {
    type: Number,
  },
  forecast: {
    type: Number,
  },
  delta: {
    type: Number,
    required: true,
  },
});

const HVSITPForecast = mongoose.model("HVSITPForecast", HVSITPForecastSchema);

export default HVSITPForecast;
