import express from "express";
import { pool } from "../database";
import { authMiddleware, authorizeRole, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.post("/:submissionId", authMiddleware, authorizeRole(["reviewer"]), async (req: AuthRequest, res) => {
  const { content } = req.body;
  const reviewer_id = req.user!.id;
  const submission_id = req.params.submissionId;

  if (!content) return res.status(400).send("Comment content is required");

  try {
    const result = await pool.query(
      "INSERT INTO comments (submission_id, reviewer_id, content) VALUES ($1, $2, $3) RETURNING *",
      [submission_id, reviewer_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding comment");
  }
});

router.get("/:submissionId", authMiddleware, async (req, res) => {
  const { submissionId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.*, u.name AS reviewer_name 
       FROM comments c 
       JOIN users u ON c.reviewer_id = u.id
       WHERE c.submission_id = $1`,
      [submissionId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching comments");
  }
});

export default router;
