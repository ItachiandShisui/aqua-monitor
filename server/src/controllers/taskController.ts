import type { Request, Response } from "express";
import Task from "../models/Task";

export async function getAllTasks(req: Request, res: Response) {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error while retrieving: ", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function createTask(req: Request, res: Response) {
  try {
    const { status, priority, adress, type, title, message, assigned_to } =
      req.body;
    const task = new Task({
      status,
      priority,
      adress,
      type,
      title,
      message,
      assigned_to,
    });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error while creating: ", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const { _id, id, ...updatedFields } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error while updating: ", error);
    res.status(500).json({ message: "Server Error" });
  }
}
