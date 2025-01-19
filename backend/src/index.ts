import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import feedbackRoutes from './routes/feedback';
import municipalityRoutes from './routes/municipality';
import userRoutes from './routes/user';
import subscriptionRoutes from './routes/subscription';
import locationRoutes from './routes/location';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notification';
import translationsRouter from './routes/translations';

// Initialize Express app
const app = express();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Redis client
export const redis = new Redis(process.env.REDIS_URL as string);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow more requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Municipal AR Feedback API',
      version: '1.0.0',
      description: 'API documentation for Municipal AR Feedback system'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/api/${process.env.API_VERSION}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    path.join(__dirname, 'routes', '*.ts'),
    path.join(__dirname, 'routes', '*.js')
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
const apiRouter = express.Router();

// Root route
app.get('/', ((req: Request, res: Response) => {
  res.json({
    message: 'Municipal AR Feedback API',
    version: apiVersion,
    docs: `/api/${apiVersion}/docs`
  });
}) as unknown as express.RequestHandler);

// API Documentation
const swaggerSetup = swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Municipal AR Feedback API Documentation'
});

// Serve Swagger UI at /api/v1/docs
app.use(`/api/${apiVersion}/docs`, swaggerUi.serve as unknown as express.RequestHandler[]);
app.get(`/api/${apiVersion}/docs`, swaggerSetup as unknown as express.RequestHandler);

// Apply rate limiting to auth routes
apiRouter.use('/auth', authLimiter);

// API Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/feedback', feedbackRoutes);
apiRouter.use('/municipalities', municipalityRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);
apiRouter.use('/location', locationRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/translations', translationsRouter);

// Mount API routes at /api/v1
app.use(`/api/${apiVersion}`, apiRouter);

// Error handling middleware
app.use(((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'Something went wrong'
  });
}) as unknown as express.ErrorRequestHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/api/${apiVersion}/docs`);
}); 