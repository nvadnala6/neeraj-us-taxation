import fs from "fs";
import express from "express";
// other imports...

const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
// middleware...
// routes...

//app.listen(process.env.PORT || 4000, () => console.log("Server running"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));


