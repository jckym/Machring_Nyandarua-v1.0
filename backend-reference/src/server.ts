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
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS
const allowedOrigins: (string | RegExp)[] = [
  process.env.FRONTEND_URL,
  'https://mr-final-dashboard.vercel.app',
  /^https:\/\/mr-final-dashboard.*\.vercel\.app$/,
  'https://mrfinaldashboard.vercel.app',
  /\.lovable\.app$/,
  /\.lovableproject\.com$/,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080'
].filter(Boolean) as (string | RegExp)[];

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed =>
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    )) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Seed admin user (bootstrap)
const seedAdminUser = async () => {
  const adminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'jckym001@gmail.com').toLowerCase();
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Admin.mr01';
  const shouldResetPassword = process.env.BOOTSTRAP_ADMIN_RESET_PASSWORD === 'true';

  try {
    // Always ensure THIS admin exists (even if other admins already exist)
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

    if (admin.role !== 'admin') {
      admin.role = 'admin';
      changed = true;
    }

    if (admin.status !== 'active') {
      admin.status = 'active';
      changed = true;
    }

    if (shouldResetPassword) {
      admin.password = adminPassword;
      changed = true;
    }

    if (changed) {
      await admin.save();
      console.log(`✅ Bootstrap admin updated: ${adminEmail}${shouldResetPassword ? ' (password reset)' : ''}`);
    } else {
      console.log(`ℹ️ Bootstrap admin already ok: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Failed to seed bootstrap admin user:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await seedAdminUser();
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
