import './config'; // loads .env first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { db, pruneExpiredRevokedTokens, seedAdmin, seedSampleContent, seedSampleMembers } from './db';
import { UPLOAD_DIR, errorHandler, requestLogger, requireAdmin } from './middleware';
import authRouter from './routes/auth';
import contentRouter from './routes/content';
import { adminRouter, publicRouter, syncExpireLapsedMembers } from './routes/members';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'sameorigin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Cross-Origin Resource Sharing
app.use(cors({ origin: config.corsOrigins.includes('*') ? true : config.corsOrigins }));

// Request body size limit
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Structured request logging
app.use(requestLogger);

// Global API rate limiting to protect against Denial of Service (DoS)
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: ['Rate limit exceeded. Please slow down and try again later.'] },
});
app.use('/api', apiRateLimiter);

// Serve uploaded member photos at /uploads/<filename>
app.use('/uploads', express.static(UPLOAD_DIR));

// Root health check endpoint (backwards compatible)
app.get('/', (_req, res) =>
  res.json({
    service: 'membership-backend-api',
    status: 'ok',
    version: '1.0.0',
  })
);

// Comprehensive system & database health check
app.get('/api/health', (_req, res) => {
  try {
    const dbCheck = db.prepare('SELECT COUNT(*) c FROM members').get() as { c: number };
    const mem = process.memoryUsage();
    res.json({
      status: 'healthy',
      service: 'membership-backend-api',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        total_members: dbCheck.c,
      },
      memory_usage_mb: {
        rss: Math.round(mem.rss / 1024 / 1024 * 100) / 100,
        heap_used: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
      },
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: (err as Error).message,
    });
  }
});

// API routes
app.use('/api', publicRouter);                      // /config, /members, /register, /payments/...
app.use('/api', authRouter);                        // /admin/login, /admin/logout, /admin/password, /admin/me
app.use('/api/admin', requireAdmin, adminRouter);   // /admin/members, /admin/stats, /admin/audit-logs, /admin/backup
app.use('/api', contentRouter);                     // /team, /events, /gallery, /contact, /donations (+ /admin/cms)

app.use('/api', (_req, res) => res.status(404).json({ errors: ['Endpoint not found.'] }));
app.use(errorHandler);

// Database initial seeding
seedAdmin();
seedSampleMembers();
seedSampleContent();

// Periodically prune expired revoked JWT entries (runs every 30 minutes)
const pruneTimer = setInterval(pruneExpiredRevokedTokens, 30 * 60 * 1000);
if (pruneTimer.unref) pruneTimer.unref();

// Periodically auto-expire members whose validity date has passed (runs every 15 minutes)
const expireTimer = setInterval(async () => {
  try {
    const { sqliteExpired, supabaseExpired } = await syncExpireLapsedMembers();
    if (sqliteExpired > 0 || supabaseExpired > 0) {
      console.log(`⏰ [Auto-Expiry] Flagged lapsed members as Inactive: ${sqliteExpired} (SQLite) / ${supabaseExpired} (Supabase)`);
    }
  } catch (err) {
    console.error('Auto-expiry task error:', err);
  }
}, 15 * 60 * 1000);
if (expireTimer.unref) expireTimer.unref();

// Immediate auto-expiry check on startup
syncExpireLapsedMembers().then(({ sqliteExpired, supabaseExpired }) => {
  if (sqliteExpired > 0 || supabaseExpired > 0) {
    console.log(`⏰ [Auto-Expiry startup] Flagged lapsed members as Inactive: ${sqliteExpired} (SQLite) / ${supabaseExpired} (Supabase)`);
  }
}).catch(() => {});

export { app };

if (process.env.NODE_ENV !== 'test' && process.env.SKIP_LISTEN !== 'true') {
  app.listen(config.port, () => {
    console.log(`🚀 Membership Backend API running on http://localhost:${config.port}`);
    console.log(`📡 Ready for frontend requests (CORS enabled)`);
  });
}
