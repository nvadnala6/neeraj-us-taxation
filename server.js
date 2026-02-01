import fs from "fs";
import express from "express";
import cors from "cors";

// Local imports (since everything is in root)
import authRoutes from "./auth.js";
import docRoutes from "./docs.js";
import caseRoutes from "./cases.js";
import estimateRoutes from "./estimate.js";

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes
app.get("/", (req, res) => {
  res.send("US Taxation Backend is running ✅");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/estimate", estimateRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
