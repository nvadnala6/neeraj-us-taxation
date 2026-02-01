import fs from "fs";
import express from "express";
import cors from "cors";

// ✅ Ensure uploads folder exists (Render needs this)
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

// ✅ Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Root + Health routes
app.get("/", (req, res) => {
  res.send("US Taxation Backend is running ✅");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ✅ Mount API routes (adjust paths if needed)
import authRoutes from "./routes/auth.js";
import docRoutes from "./routes/docs.js";
import caseRoutes from "./routes/cases.js";
import estimateRoutes from "./routes/estimate.js";

app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/estimate", estimateRoutes);

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

