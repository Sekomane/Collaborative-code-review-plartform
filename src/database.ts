import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres", 
  host: "localhost",
  database: "codereview",
  password: "Rori123",
  port: 5432,
});
