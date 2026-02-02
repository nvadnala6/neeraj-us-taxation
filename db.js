import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

/**
 * DB path priority:
 * 1) SQLITE_FILE env var (recommended on Render)
 * 2) local fallback ./data/data.db
 *
 * Render Free Tier: use /tmp/app.db (resets on restart)
 * Render Paid + Disk: use /var/data/app.db (persists if disk mounted)
 */
const defaultDbPath = path.join(process.cwd(), "data", "data.db");
const dbFile = process.env.SQLITE_FILE || defaultDbPath;

// Ensure parent directory exists (important if using ./data/data.db)
const parentDir = path.dirname(dbFile);
if (!fs.existsSync(parentDir)) {
  fs.mkdirSync(parentDir, { recursive: true });
}

export const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("❌ Failed to open SQLite DB:", dbFile, err);
  } else {
    console.log("✅ SQLite DB opened at:", dbFile);
  }
});

export function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          created_at TEXT NOT NULL
        );`,
        (err) => {
          if (err) {
            console.error("❌ DB ERROR creating users table:", err);
            return reject(err);
          }
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS cases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'Draft',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`,
        (err) => {
          if (err) {
            console.error("❌ DB ERROR creating cases table:", err);
            return reject(err);
          }
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          original_name TEXT NOT NULL,
          stored_name TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          uploaded_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`,
        (err) => {
          if (err) {
            console.error("❌ DB ERROR creating documents table:", err);
            return reject(err);
          }
          // Only resolve after the last table create finishes
          resolve();
        }
      );
    });
  });
}

export function seedAdmin() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM users WHERE email=?",
      ["admin@example.com"],
      async (err, row) => {
        if (err) {
          console.error("❌ DB ERROR (seedAdmin SELECT):", err);
          return reject(err);
        }

        if (row) return resolve(); // already exists

        try {
          const hash = await bcrypt.hash("Admin@123", 10);
          const now = new Date().toISOString();

          db.run(
            "INSERT INTO users(email,password_hash,role,created_at) VALUES (?,?,?,?)",
            ["admin@example.com", hash, "admin", now],
            function (err2) {
              if (err2) {
                console.error("❌ DB ERROR (seedAdmin INSERT user):", err2);
                return reject(err2);
              }

              const userId = this.lastID;

              db.run(
                "INSERT INTO cases(user_id,status,created_at,updated_at) VALUES (?,?,?,?)",
                [userId, "Draft", now, now],
                (err3) => {
                  if (err3) {
                    console.error("❌ DB ERROR (seedAdmin INSERT case):", err3);
                    return reject(err3);
                  }
                  console.log("✅ Seeded admin user: admin@example.com / Admin@123");
                  resolve();
                }
              );
            }
          );
        } catch (e) {
          console.error("❌ seedAdmin failed:", e);
          reject(e);
        }
      }
    );
  });
}
``
