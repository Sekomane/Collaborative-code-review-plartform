import express from "express";
import { pool } from "../database";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching notifications");
  }
});

router.patch("/:id/read", authMiddleware, async (req: AuthRequest, res) => {
  const notificationId = parseInt(req.params.id);

  try {
    const result = await pool.query(
      "UPDATE notifications SET is_read=true WHERE id=$1 RETURNING *",
      [notificationId]
    );
    if (result.rows.length === 0) return res.status(404).send("Notification not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating notification");
  }
});

export default router;
