# US Taxation Backend (Express + SQLite + JWT)

**For educational/demo use only. Do not use as-is with real PII.**

## Features
- Auth: Register/Login with **JWT** & password hashing (**bcrypt**)
- RBAC: `user` and `admin` roles
- Document upload: **multer** to local `uploads/` with metadata in SQLite
- Cases/status: track and update case status (Admin)
- Mock tax estimate endpoint
- Security: `helmet`, `rate-limit`, CORS, basic file-type checks

## Quick start
```bash
# 1) Install dependencies
npm install

# 2) Create a .env
cp .env.example .env
# (edit JWT_SECRET if you want)

# 3) Run (dev)
npm run dev
# or production
npm start
```

App listens on **http://localhost:4000** by default

### Default Admin
- Email: **admin@example.com**
- Password: **Admin@123**

> Seeded on first run if not already present.

## API Overview
- `POST /api/auth/register` — `{ email, password }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `POST /api/docs/upload` — `multipart/form-data` `file` (user)
- `GET  /api/docs/my` — list current user's docs
- `GET  /api/docs/all` — (admin) list all docs
- `GET  /api/cases/my` — current user's case status
- `POST /api/cases/status` — (admin) `{ email, status }`
- `POST /api/estimate/mock` — `{ income, deductions }`

## Notes
- In production, follow **IRS Pub 4557** for safeguards (MFA, encryption, audit logs, incident response) and align password/MFA with **NIST SP 800-63B**.
- Replace local disk storage with cloud/object storage and add encryption-at-rest + KMS.
