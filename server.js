import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// CRITICAL: Check if variables exist before starting
if (!process.env.MYSQL_HOST) {
  console.error("❌ ERROR: MYSQL_HOST is not defined in environment variables.");
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Database pool - Added connection timeout and charset for better stability
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT) || 3306,
  ssl: {
    rejectUnauthorized: false 
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000 // 10 seconds timeout
});

// API Routes
app.get("/api/db-test", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection(); 
    const [rows] = await connection.query("SELECT NOW() AS now");
    
    res.json({
      success: true,
      message: "Database connected successfully",
      time: rows[0].now
    });
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({
      success: false,
      error: "Database Connection Error",
      details: err.message
    });
  } finally {
    if (connection) connection.release(); // Proper cleanup
  }
});

// Serve React/Vite website
app.use(express.static(path.join(__dirname, "dist")));

// React fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
