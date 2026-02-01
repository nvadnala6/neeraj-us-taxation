import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const dbFile = './data.db';
export const db = new sqlite3.Database(dbFile);

export function initDb(){
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL
      );`);

      db.run(`CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Draft',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`);

      db.run(`CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        original_name TEXT NOT NULL,
        stored_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`);
      resolve();
    });
  });
}

export function seedAdmin(){
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email=?', ['admin@example.com'], async (err, row) => {
      if (err) return reject(err);
      if (row) return resolve();
      const hash = await bcrypt.hash('Admin@123', 10);
      const now = new Date().toISOString();
      db.run('INSERT INTO users(email,password_hash,role,created_at) VALUES (?,?,?,?)', ['admin@example.com', hash, 'admin', now], function(err){
        if (err) return reject(err);
        const userId = this.lastID;
        db.run('INSERT INTO cases(user_id,status,created_at,updated_at) VALUES (?,?,?,?)', [userId, 'Draft', now, now], (err2)=>{
          if (err2) return reject(err2);
          resolve();
        });
      });
    });
  });
}
