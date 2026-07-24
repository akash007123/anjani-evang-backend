import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { connectDb } from './services/databaseService.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();
  await connectDb();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Backend] Eveng Catering Enterprise API Server running on port ${PORT}`);
  });
}

startServer();
