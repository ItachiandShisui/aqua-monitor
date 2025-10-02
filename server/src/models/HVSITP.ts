import mongoose from "mongoose";
import type { IHVSITP } from "../types/sheets";

const HVSITPSchema = new mongoose.Schema<IHVSITP>({
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
    required: true,
  },
  delta: {
    type: Number,
    required: true,
  },
  datetime: {
    type: Date,
    required: true,
  },
});

const HVSITP = mongoose.model("HVSITP", HVSITPSchema);

export default HVSITP;
