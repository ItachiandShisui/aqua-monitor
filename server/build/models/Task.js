"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
const Task = mongoose_1.default.model("Task", taskSchema);
exports.default = Task;
