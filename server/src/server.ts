import app from './app';
import prisma from './config/prisma';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
  console.log(`API docs: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown: stop accepting connections, then close the DB pool
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received - shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed and Prisma client disconnected.');
    process.exit(0);
  });
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
