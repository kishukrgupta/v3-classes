const config = require('./config');
const app = require('./app');
const prisma = require('./utils/prisma');

const PORT = config.port;

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  if (config.isDev) console.error(err.stack);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  if (config.isDev) console.error(err.stack);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   V3 Classes Backend Server              ║
  ║   Running on: http://localhost:${PORT}      ║
  ║   Environment: ${config.nodeEnv.padEnd(20)}  ║
  ╚══════════════════════════════════════════╝
  `);
});
