import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { connectDb } from './services/databaseService.js';
import { setupSocket } from './socket/index.js';
import { seedAdmin } from './seeds/adminSeed.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  const dbConnected = await connectDB();
  await connectDb();

  if (dbConnected) {
    await seedAdmin();
  }

  const httpServer = http.createServer(app);
  setupSocket(httpServer);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend] Eveng Catering API Server running on port ${PORT}`);
  });
}

startServer();
