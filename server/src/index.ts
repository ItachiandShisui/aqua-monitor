import path from "path";
import express from "express";
import cors from "cors";
import type { Application, Request, Response } from "express";
import passport from "passport";
import dotenv from "dotenv";
import history from "connect-history-api-fallback";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import { connectDB } from "./config/db";

dotenv.config();
const app: Application = express();

connectDB();

app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api", passport.authenticate("jwt", { session: false }), taskRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/dist")));
  app.use((req: Request, res: Response, next) => {
    res
      .status(200)
      .sendFile(path.join(__dirname, "../../client/dist/index.html"));
  });
} else {
  app.use(cors());
}

// Handle routing from front-end
app.use(history());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
