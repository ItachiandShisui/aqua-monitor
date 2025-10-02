import mongoose from "mongoose";
import type { IGVS } from "../types/sheets";

const GVSSchema = new mongoose.Schema<IGVS>({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  to: {
    type: Number,
    required: true,
  },
  out: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  t1: {
    type: Number,
    required: true,
  },
  t2: {
    type: Number,
    required: true,
  },
  datetime: {
    type: Date,
    required: true,
  },
});

const GVS = mongoose.model("GVS", GVSSchema);

export default GVS;
