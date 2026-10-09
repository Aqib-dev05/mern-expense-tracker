import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import routes from './routes/index.js';
import ApiError from './utils/ApiError.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

if (env.isProd) app.set('trust proxy', 1); // correct client IPs for rate limiting behind a reverse proxy

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // Non-browser clients (curl, health checks) send no Origin header.
      if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
      return cb(new ApiError(403, 'Origin not allowed by CORS'));
    },
    exposedHeaders: ['Content-Disposition'],
  })
);
app.use(express.json({ limit: '100kb' }));
if (!env.isProd) app.use(morgan('dev'));

app.use('/api', apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);

export default app;
