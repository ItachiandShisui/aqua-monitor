import mongoose from "mongoose";
import type { ITask } from "../types/tasks.ts";

const taskSchema = new mongoose.Schema<ITask>(
  {
    status: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    adress: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    assigned_to: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
