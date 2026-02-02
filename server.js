import fs from "fs";
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Routers (root files)
import authRoutes from "./auth.js";
import docRoutes from "./docs.js";
import caseRoutes from "./cases.js";
import estimateRoutes from "./estimate.js";

// Ensure uploads folder exists
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health checks
app.get("/", (req, res) => res.send("US Taxation Backend is running ✅"));
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/estimate", estimateRoutes);

app.use(morgan("combined"));

// Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

