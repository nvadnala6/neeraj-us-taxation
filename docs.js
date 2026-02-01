import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { db } from './db.js';
import { requireAuth, requireRole } from './middleware/auth.js';

const router = Router();
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;
    cb(null, safe);
  }
});

function fileFilter(req, file, cb){
  const allowed = ['application/pdf','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if(allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type'));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  const userId = req.user.id;
  const { originalname, filename, mimetype, size } = req.file;
  const now = new Date().toISOString();
  db.run('INSERT INTO documents(user_id,original_name,stored_name,mime_type,size,uploaded_at) VALUES (?,?,?,?,?,?)', [userId, originalname, filename, mimetype, size, now], function(err){
    if(err) return res.status(500).json({ error: 'DB error' });
    return res.json({ id: this.lastID, originalname, url: `/uploads/${filename}` });
  });
});

router.get('/my', requireAuth, (req, res) => {
  db.all('SELECT id, original_name, mime_type, size, uploaded_at FROM documents WHERE user_id=? ORDER BY uploaded_at DESC', [req.user.id], (err, rows) => {
    if(err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

router.get('/all', requireAuth, requireRole('admin'), (req, res) => {
  db.all(`SELECT d.id, u.email as user, d.original_name, d.mime_type, d.size, d.uploaded_at
          FROM documents d JOIN users u ON u.id=d.user_id
          ORDER BY d.uploaded_at DESC`, [], (err, rows) => {
    if(err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

export default router;
