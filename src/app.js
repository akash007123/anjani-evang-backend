import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { apiDocs } from './docs/swaggerSpec.js';

const app = express();

// Security and utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Base API Routes
app.use('/api', routes);

// API Documentation Endpoint
app.get('/api/docs', (req, res) => {
  res.json(apiDocs);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Eveng Catering Enterprise Backend',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handling Middleware
app.use(errorHandler);

export default app;
