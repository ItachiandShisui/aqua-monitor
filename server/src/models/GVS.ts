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
  },
  t2: {
    type: Number,
  },
  datetime: {
    type: Date,
    required: true,
  },
  diff: {
    type: Number,
  },
  temp_warning: {
    type: Number,
    required: true,
  },
  delta: {
    type: Number,
  },
  deviation: {
    type: Number,
  },
  deviation_warning: {
    type: Number,
  },
});

const GVS = mongoose.model("GVS", GVSSchema);

export default GVS;
