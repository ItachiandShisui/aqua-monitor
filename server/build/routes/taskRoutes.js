"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_ts_1 = require("../controllers/taskController.ts");
const router = express_1.default.Router();
router.get("/getTasks", taskController_ts_1.getAllTasks);
router.post("/createTask", taskController_ts_1.createTask);
router.patch("/updateTask/:id", taskController_ts_1.updateTask);
exports.default = router;
