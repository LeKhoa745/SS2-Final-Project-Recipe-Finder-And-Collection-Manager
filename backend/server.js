import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { logger } from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`   Environment : ${process.env.NODE_ENV}`);
      logger.info(`   Client URL  : ${process.env.CLIENT_URL}`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  process.exit(0);
});

bootstrap();
