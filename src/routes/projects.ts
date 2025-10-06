import express from "express";
import { pool } from "../database";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).send("Project name is required");

  try {
    const result = await pool.query(
      "INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating project");
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching projects");
  }
});

router.post("/:id/members", authMiddleware, async (req, res) => {
  const { userId } = req.body;
  const projectId = req.params.id;
  if (!userId) return res.status(400).send("userId is required");

  try {
    const result = await pool.query(
      "INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) RETURNING *",
      [projectId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding member");
  }
});

router.delete("/:id/members/:userId", authMiddleware, async (req, res) => {
  const projectId = req.params.id;
  const userId = req.params.userId;

  try {
    await pool.query(
      "DELETE FROM project_members WHERE project_id=$1 AND user_id=$2",
      [projectId, userId]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error removing member");
  }
});

export default router;
