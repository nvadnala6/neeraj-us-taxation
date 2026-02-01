import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email and password required' });
  const hash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  db.run('INSERT INTO users(email,password_hash,role,created_at) VALUES (?,?,?,?)', [email, hash, 'user', now], function(err){
    if(err){
      if(String(err).includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
      return res.status(500).json({ error: 'DB error' });
    }
    const userId = this.lastID;
    db.run('INSERT INTO cases(user_id,status,created_at,updated_at) VALUES (?,?,?,?)', [userId, 'Draft', now, now]);
    const token = jwt.sign({ id:userId, email, role:'user' }, process.env.JWT_SECRET || 'dev_super_secret_change_me', { expiresIn:'8h' });
    return res.json({ token, user: { email, role:'user' } });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email and password required' });
  db.get('SELECT * FROM users WHERE email=?', [email], async (err, row) => {
    if(err) return res.status(500).json({ error: 'DB error' });
    if(!row) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: row.id, email: row.email, role: row.role }, process.env.JWT_SECRET || 'dev_super_secret_change_me', { expiresIn:'8h' });
    return res.json({ token, user: { email: row.email, role: row.role } });
  });
});

export default router;
