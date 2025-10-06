import express from "express";
import { pool } from "../database";
import { authMiddleware, authorizeRole, AuthRequest } from "../middleware/auth";
import bcrypt from "bcrypt";

const router = express.Router();

// Get user profile by ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const userId = parseInt(req.params.id);

  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).send("User not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Error fetching user");
  }
});

// Update user profile by ID
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, password } = req.body;

  if (!name && !email && !password)
    return res.status(400).send("At least one field is required to update");

  try {
    let query = "UPDATE users SET ";
    const fields: string[] = [];
    const values: any[] = [];

    if (name) {
      fields.push(`name=$${fields.length + 1}`);
      values.push(name);
    }
    if (email) {
      fields.push(`email=$${fields.length + 1}`);
      values.push(email);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push(`password=$${fields.length + 1}`);
      values.push(hashed);
    }

    values.push(userId);
    query += fields.join(", ") + ` WHERE id=$${values.length} RETURNING id, name, email, role, created_at`;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).send("User not found");

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Error updating user");
  }
});

// Delete user by ID
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const userId = parseInt(req.params.id);

  //this will Only allow the user themselves or a reviewer role (for example) to delete
  if (req.user?.id !== userId && req.user?.role !== "reviewer") {
    return res.status(403).send("Forbidden");
  }

  try {
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING id", [userId]);
    if (result.rows.length === 0) return res.status(404).send("User not found");

    res.json({ message: "User deleted successfully", userId });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Error deleting user");
  }
});

export default router;
