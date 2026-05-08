import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; // Added for API access
import dotenv from "dotenv";

dotenv.config(); // Ensure variables are loaded

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Middlewares
app.use(cors()); // Allows your React app to fetch data
app.use(express.json());

// 2. Database pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT) || 3306,
  ssl: {
    rejectUnauthorized: false // Required for most cloud DBs like Aiven/Railway
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true, // Prevents "connection lost" errors
  keepAliveInitialDelay: 10000
});

// 3. API Routes (Must be BEFORE static files)
app.get("/api/db-test", async (req, res) => {
  try {
    const connection = await pool.getConnection(); // Get connection to check pool health
    const [rows] = await connection.query("SELECT NOW() AS now");
    connection.release(); // Always release back to pool
    
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
  }
});

// 4. Serve React/Vite website
// Ensure the 'dist' folder exists after running 'npm run build'
app.use(express.static(path.join(__dirname, "dist")));

// 5. React fallback route (Must be the very last route)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
