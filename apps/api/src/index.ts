import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import driveRoutes from './routes/drive.routes';
import notificationRoutes from './routes/notification.routes';
import studentRoutes from './routes/student.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';
import hrRoutes from './routes/hr.routes';
import publicRoutes from './routes/public.routes';
import { initFirebaseAdmin } from './config/firebase-admin';

dotenv.config();

initFirebaseAdmin();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/drives', driveRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PlacementX API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
