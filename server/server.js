import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { ensureDefaultCategories, ensureAdmin } from './config/seed.js';
import mongoose from 'mongoose';
import app from './app.js';

async function start() {
  const server = app.listen(env.port, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    console.log(`=================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${env.port} is already in use.`);
      console.error(`Run this command in PowerShell to free it:\nStop-Process -Id (Get-NetTCPConnection -LocalPort ${env.port}).OwningProcess -Force\n`);
    } else {
      console.error('Server error:', err);
    }
  });

  try {
    await connectDB();
    await ensureDefaultCategories();
    await ensureAdmin();
  } catch (err) {
    console.error('\n❌ MONGODB CONNECTION ERROR:');
    console.error(err.message);
    console.error('=================================================\n');
  }

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

start();
