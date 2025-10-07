import express, { Response } from "express";
import cors from "cors";
import { pool } from "./database";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import { authMiddleware, AuthRequest } from "./middleware/auth";
import projectRoutes from "./routes/projects";
import submissionRoutes from "./routes/submissions";
import commentRoutes from "./routes/comments";
import notificationRoutes from "./routes/notifications";
import statsRoutes from "./routes/stats";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);

app.get("/", (req, res) => {
  res.send("Collaborative Code Review API is running 🚀");
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting to database");
  }
});

app.get("/api/protected", authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
