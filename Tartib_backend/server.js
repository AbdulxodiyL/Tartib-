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
import habitRoutes from './routes/habits.js';
import subscriptionRoutes from './routes/subscription.js';
import goalRoutes from './routes/goals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  ...(process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(origin => origin.trim()),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('CORS origin ruxsat etilmagan.'));
  },
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
app.use('/api/habits', habitRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/goals', goalRoutes);

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
