import express, { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiVersion = process.env.API_VERSION || 'v1';

// Middleware
app.use(cors({
  origin: ['http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Swagger documentation setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Municipal AR Feedback API',
      version: '1.0.0',
      description: 'API documentation for Municipal AR Feedback System'
    },
    servers: [
      {
        url: `http://localhost:${port}/api/${apiVersion}`
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
const swaggerSetup = swaggerUi.setup(swaggerDocs);

// Swagger UI route
app.use(`/api/${apiVersion}/docs`, swaggerUi.serve as unknown as RequestHandler[]);
app.get(`/api/${apiVersion}/docs`, swaggerSetup as unknown as RequestHandler);

// Import route handlers
import authRouter from './routes/auth';
import feedbackRouter from './routes/feedback';
import municipalitiesRouter from './routes/municipalities';
import usersRouter from './routes/users';
import translationsRouter from './routes/translations';

// API routes
app.use(`/api/${apiVersion}/auth`, authRouter);
app.use(`/api/${apiVersion}/feedback`, feedbackRouter);
app.use(`/api/${apiVersion}/municipalities`, municipalitiesRouter);
app.use(`/api/${apiVersion}/users`, usersRouter);
app.use(`/api/${apiVersion}/translations`, translationsRouter);

// Health check
const healthCheck: RequestHandler = (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
};
app.get('/', healthCheck);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
  next(err);
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 