import express from 'express';
import cors from 'cors';

import './db';
import authRoutes from './authRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Student Registration Backend' });
});

app.use('/auth', authRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

