import express from "express";
import {
  createTask,
  getAllTasks,
  updateTask,
} from "../controllers/taskController";

const router = express.Router();

router.get("/getTasks", getAllTasks);
router.post("/createTask", createTask);
router.patch("/updateTask/:id", updateTask);

export default router;
