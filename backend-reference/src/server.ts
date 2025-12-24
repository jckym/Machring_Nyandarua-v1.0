// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { User } from './models/User';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import farmerRoutes from './routes/farmers';
import localMrRoutes from './routes/localMrs';
import productRoutes from './routes/products';
import saleRoutes from './routes/sales';
import mechanisationRoutes from './routes/mechanisation';
import visitRoutes from './routes/visits';
import trainingRoutes from './routes/trainings';
import machineryRoutes from './routes/machinery';
import notificationRoutes from './routes/notifications';
import approvalRoutes from './routes/approvals';
import dashboardRoutes from './routes/dashboard';
import logRoutes from './routes/logs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// === CORS: Production-only origins ===
const allowedOrigins: (string | RegExp)[] = [
  process.env.FRONTEND_URL,                          // e.g. https://yourapp.com
  'https://mr-final-dashboard.vercel.app',
  /^https:\/\/mr-final-dashboard-.*\.vercel\.app$/,  // Vercel preview URLs (safe to keep for deployments)
].filter(Boolean) as (string | RegExp)[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests or tools with no origin (e.g. health checks)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) =>
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// === Security & Performance Middleware ===
app.use(helmet()); // Full security headers in production
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === Health Check ===
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'production',
    uptime: process.uptime(),
  });
});

// === API Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/mrs', localMrRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/mechanisations', mechanisationRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/machinery', machineryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logRoutes);

// === 404 Handler ===
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// === Global Error Handler ===
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Unhandled Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error', // No details leaked in production
  });
});

// === Bootstrap Admin User ===
const seedAdminUser = async () => {
  const adminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'jckym001@gmail.com').toLowerCase();
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Admin.mr01';
  const shouldResetPassword = process.env.BOOTSTRAP_ADMIN_RESET_PASSWORD === 'true';

  try {
    let admin = await User.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      admin = new User({
        name: 'System Admin',
        email: adminEmail,
        phone: '0711417507',
        password: adminPassword,
        role: 'admin',
        status: 'active',
      });
      await admin.save();
      console.log(`✅ Bootstrap admin created: ${adminEmail}`);
      return;
    }

    let changed = false;
    if (admin.role !== 'admin') { admin.role = 'admin'; changed = true; }
    if (admin.status !== 'active') { admin.status = 'active'; changed = true; }
    if (shouldResetPassword) { admin.password = adminPassword; changed = true; }

    if (changed) {
      await admin.save();
      console.log(`✅ Bootstrap admin updated: ${adminEmail}${shouldResetPassword ? ' (password reset)' : ''}`);
    } else {
      console.log(`ℹ️ Bootstrap admin already ok: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Failed to bootstrap admin user:', error);
  }
};

// === Start Server ===
const startServer = async () => {
  try {
    await connectDB();
    await seedAdminUser();

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: production`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
