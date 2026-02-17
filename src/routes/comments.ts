import express from "express";
import { pool } from "../database";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.post("/:submissionId/approve", authMiddleware, async (req: AuthRequest, res) => {
  const { submissionId } = req.params;
  const reviewer_id = req.user?.id;
  const { comments } = req.body;

  try {
    const subResult = await pool.query(
      "SELECT user_id FROM submissions WHERE id=$1",
      [submissionId]
    );

    if (subResult.rows.length === 0)
      return res.status(404).json({ error: "Submission not found" });

    const submitterId = subResult.rows[0].user_id;
    if (submitterId === reviewer_id)
      return res.status(403).json({ error: "You cannot review your own submission" });

    await pool.query(
      `INSERT INTO reviews (submission_id, reviewer_id, decision, comments)
       VALUES ($1, $2, 'approved', $3)`,
      [submissionId, reviewer_id, comments || null]
    );

    await pool.query(
      `UPDATE submissions SET status='approved' WHERE id=$1`,
      [submissionId]
    );

    res.json({ message: "Submission approved successfully" });
  } catch (err) {
    console.error("Error approving submission:", err);
    res.status(500).json({ error: "Error approving submission" });
  }
});

router.post("/:submissionId/request-changes", authMiddleware, async (req: AuthRequest, res) => {
  const { submissionId } = req.params;
  const reviewer_id = req.user?.id;
  const { comments } = req.body;

  try {
    const subResult = await pool.query(
      "SELECT user_id FROM submissions WHERE id=$1",
      [submissionId]
    );

    if (subResult.rows.length === 0)
      return res.status(404).json({ error: "Submission not found" });

    const submitterId = subResult.rows[0].user_id;
    if (submitterId === reviewer_id)
      return res.status(403).json({ error: "You cannot review your own submission" });

    await pool.query(
      `INSERT INTO reviews (submission_id, reviewer_id, decision, comments)
       VALUES ($1, $2, 'changes_requested', $3)`,
      [submissionId, reviewer_id, comments || null]
    );

    await pool.query(
      `UPDATE submissions SET status='changes_requested' WHERE id=$1`,
      [submissionId]
    );

    res.json({ message: "Changes requested successfully" });
  } catch (err) {
    console.error("Error requesting changes:", err);
    res.status(500).json({ error: "Error requesting changes" });
  }
});

router.get("/:submissionId/reviews", authMiddleware, async (req, res) => {
  const { submissionId } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE submission_id = $1
       ORDER BY created_at DESC`,
      [submissionId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching review history:", err);
    res.status(500).json({ error: "Error fetching review history" });
  }
});

export default router;
