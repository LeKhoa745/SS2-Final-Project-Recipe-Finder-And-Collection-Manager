import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport'; 
import './config/passport.js';   
                
import authRoutes    from './routes/auth.routes.js';
import recipeRoutes  from './routes/recipe.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import { plannerRouter, shoppingRouter, newsRouter, adminRouter } from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { logger } from './utils/logger.js';

const app = express();

// ── Security ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,                              // allow cookies
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ── Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// ── Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/recipes',  recipeRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/planner',  plannerRouter);
app.use('/api/shopping', shoppingRouter);
app.use('/api/news',     newsRouter);
app.use('/api/admin',    adminRouter);

// ── Error Handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
