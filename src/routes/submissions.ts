import express from "express";
import { pool } from "../database";
import { authMiddleware, authorizeRole, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, authorizeRole(["submitter"]), async (req: AuthRequest, res) => {
  const { project_id, code } = req.body;
  const user_id = req.user!.id;

  if (!project_id || !code) return res.status(400).send("Project ID and code are required");

  try {
    const result = await pool.query(
      "INSERT INTO submissions (project_id, user_id, code) VALUES ($1, $2, $3) RETURNING *",
      [project_id, user_id, code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating submission");
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.name AS submitter_name, p.name AS project_name
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN projects p ON s.project_id = p.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching submissions");
  }
});

router.put("/:id/status", authMiddleware, authorizeRole(["reviewer"]), async (req, res) => {
  const { status } = req.body;
  const id = req.params.id;

  if (!["pending", "approved", "changes_requested"].includes(status)) {
    return res.status(400).send("Invalid status");
  }

  try {
    const result = await pool.query(
      "UPDATE submissions SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating status");
  }
});

export default router;
