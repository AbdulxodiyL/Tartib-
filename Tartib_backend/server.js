import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db/database.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import transactionRoutes from './routes/transactions.js';
import sessionRoutes from './routes/sessions.js';
import profileRoutes from './routes/profile.js';
import settingsRoutes from './routes/settings.js';
import eventRoutes from './routes/events.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Tartib API' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server xatosi yuz berdi' });
});

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Tartib server http://localhost:${PORT} da ishlamoqda`);
    });
  })
  .catch((err) => {
    console.error('DB ulanishda xato:', err.message);
    process.exit(1);
  });
