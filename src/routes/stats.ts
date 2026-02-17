import express from "express";
import { pool } from "../database";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/:projectId", authMiddleware, async (req, res) => {
  const projectId = parseInt(req.params.projectId);

  try {
    const submissionResult = await pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status='approved') AS approved,
              COUNT(*) FILTER (WHERE status='changes_requested') AS changes_requested
       FROM submissions
       WHERE project_id=$1`,
      [projectId]
    );

    const avgTimeResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (r.created_at - s.created_at))) AS avg_review_time_seconds
       FROM reviews r
       JOIN submissions s ON r.submission_id = s.id
       WHERE s.project_id=$1`,
      [projectId]
    );

    const activeReviewers = await pool.query(
      `SELECT u.name, COUNT(r.id) AS review_count
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       JOIN submissions s ON r.submission_id = s.id
       WHERE s.project_id=$1
       GROUP BY u.name
       ORDER BY review_count DESC
       LIMIT 3`,
      [projectId]
    );

    res.json({
      submissions: submissionResult.rows[0],
      avg_review_time_seconds: avgTimeResult.rows[0].avg_review_time_seconds,
      top_reviewers: activeReviewers.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching project stats");
  }
});

export default router;
