import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db';

const router = express.Router();

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

type UserRow = {
  id: number;
  email: string;
  username: string;
  name: string;
  password_hash: string;
};

function createAccessToken(user: UserRow) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL_SECONDS }
  );
}

function createRefreshToken() {
  return jwt.sign({ type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL_SECONDS });
}

function logAudit(userId: number | null, action: string, metadata?: unknown) {
  db.run(
    `INSERT INTO audit_logs (user_id, action, metadata) VALUES (?, ?, ?)`,
    [userId, action, metadata ? JSON.stringify(metadata) : null]
  );
}

router.post('/register', (req, res) => {
  const { email, username, name, password } = req.body ?? {};

  if (!email || !username || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!String(email).includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const passwordHash = bcrypt.hashSync(String(password), 10);

  db.run(
    `INSERT INTO users (email, username, name, password_hash) VALUES (?, ?, ?, ?)`,
    [email, username, name, passwordHash],
    function (this: unknown, err: Error | null) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email or username already exists' });
        }
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const stmt = this as { lastID?: number };
      const userId = stmt.lastID ?? 0;

      logAudit(userId, 'REGISTER', { email, username });

      return res.status(201).json({ id: userId, email, username, name });
    }
  );
});

router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get<UserRow>(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = bcrypt.compareSync(String(password), user.password_hash);
    if (!ok) {
      logAudit(user.id, 'LOGIN_FAILED', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString();

    db.run(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [user.id, refreshToken, expiresAt],
      (insertErr) => {
        if (insertErr) {
          console.error('Refresh token insert error:', insertErr);
          return res.status(500).json({ error: 'Internal server error' });
        }

        logAudit(user.id, 'LOGIN_SUCCESS', { email });

        return res.json({
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
          },
        });
      }
    );
  });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  db.get<
    {
      user_id: number;
      email: string;
      username: string;
      name: string;
      expires_at: string;
    } | undefined
  >(
    `SELECT rt.*, u.email, u.username, u.name
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = ? AND rt.revoked_at IS NULL`,
    [refreshToken],
    (err, row) => {
      if (err) {
        console.error('Refresh error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!row) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const now = new Date();
      const expiresAt = new Date(row.expires_at);
      if (expiresAt <= now) {
        return res.status(401).json({ error: 'Refresh token expired' });
      }

      const accessToken = jwt.sign(
        {
          sub: row.user_id,
          email: row.email,
          username: row.username,
          name: row.name,
        },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL_SECONDS }
      );

      logAudit(row.user_id, 'TOKEN_REFRESH', {});

      return res.json({ accessToken });
    }
  );
});

router.post('/logout', (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  db.run(
    `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = ? AND revoked_at IS NULL`,
    [refreshToken],
    (err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      logAudit(null, 'LOGOUT', {});
      return res.json({ success: true });
    }
  );
});

export default router;

