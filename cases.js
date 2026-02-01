import { Router } from 'express';
import { db } from './db.js';
import { requireAuth, requireRole } from './middleware/auth.js';

const router = Router();

router.get('/my', requireAuth, (req, res) => {
  db.get('SELECT status, created_at, updated_at FROM cases WHERE user_id=?', [req.user.id], (err, row) => {
    if(err) return res.status(500).json({ error: 'DB error' });
    res.json(row || { status: 'Draft' });
  });
});

router.post('/status', requireAuth, requireRole('admin'), (req, res) => {
  const { email, status } = req.body;
  if(!email || !status) return res.status(400).json({ error: 'email and status required' });
  db.get('SELECT id FROM users WHERE email=?', [email], (err, userRow) => {
    if(err) return res.status(500).json({ error: 'DB error' });
    if(!userRow) return res.status(404).json({ error: 'User not found' });
    const now = new Date().toISOString();
    db.run('UPDATE cases SET status=?, updated_at=? WHERE user_id=?', [status, now, userRow.id], function(err2){
      if(err2) return res.status(500).json({ error: 'DB error' });
      res.json({ ok:true, email, status });
    });
  });
});

export default router;
