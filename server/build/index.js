"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
const taskRoutes_ts_1 = __importDefault(require("./routes/taskRoutes.ts"));
const db_ts_1 = require("./config/db.ts");
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, db_ts_1.connectDB)();
app.use(express_1.default.json());
app.use("/api", taskRoutes_ts_1.default);
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.join(__dirname, "..", "/client/dist")));
    app.use((req, res, next) => {
        res
            .status(200)
            .sendFile(path_1.default.join(__dirname, ".." + "/client/dist/index.html"));
    });
}
else {
    app.get("*", (req, res) => {
        res.send("API is running....");
    });
}
// Handle routing from front-end
app.use((0, connect_history_api_fallback_1.default)());
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
