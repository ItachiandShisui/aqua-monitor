"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTasks = getAllTasks;
exports.createTask = createTask;
exports.updateTask = updateTask;
const Task_ts_1 = __importDefault(require("../models/Task.ts"));
function getAllTasks(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tasks = yield Task_ts_1.default.find();
            res.status(200).json(tasks);
        }
        catch (error) {
            console.error("Error while retrieving: ", error);
            res.status(500).json({ message: "Server Error" });
        }
    });
}
function createTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { status, priority, adress, type, title, message, assigned_to } = req.body;
            const task = new Task_ts_1.default({
                status,
                priority,
                adress,
                type,
                title,
                message,
                assigned_to,
            });
            const savedTask = yield task.save();
            res.status(201).json(savedTask);
        }
        catch (error) {
            console.error("Error while creating: ", error);
            res.status(500).json({ message: "Server Error" });
        }
    });
}
function updateTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { _id, id } = _a, updatedFields = __rest(_a, ["_id", "id"]);
            const updatedTask = yield Task_ts_1.default.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true });
            if (!updatedTask)
                return res.status(404).json({ message: "Task not found" });
            res.status(200).json(updatedTask);
        }
        catch (error) {
            console.error("Error while updating: ", error);
            res.status(500).json({ message: "Server Error" });
        }
    });
}
