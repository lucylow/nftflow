import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRedisStore } from 'rate-limit-redis';
import { Redis } from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env['REDIS_URL']);

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://ipfs.io", 
        "https://gateway.pinata.cloud",
        "https://arweave.net",
        "https://*.ipfs.dweb.link"
      ],
      connectSrc: [
        "'self'", 
        "https://dream-rpc.somnia.network",
        "wss://dream-rpc.somnia.network",
        "https://api.pinata.cloud",
        "https://api.nft.storage"
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Rate limiting configurations
const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    ...options,
    store: createRedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: options.message || 'Rate limit exceeded',
        retryAfter: Math.round(options.windowMs / 1000)
      });
    }
  });
};

// General API rate limiting
export const apiLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skipSuccessfulRequests: false
});

// More aggressive limiter for authentication endpoints
export const authLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true
});

// Rate limiter for profile updates
export const profileUpdateLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 profile updates per hour
  message: 'Too many profile updates, please try again later.',
  skipSuccessfulRequests: true
});

// Rate limiter for post creation
export const postCreationLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 posts per hour
  message: 'Too many posts created, please try again later.',
  skipSuccessfulRequests: true
});

// Rate limiter for transaction endpoints
export const transactionLimiter = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 transactions per 5 minutes
  message: 'Too many transactions, please try again later.',
  skipSuccessfulRequests: true
});

// Rate limiter for search endpoints
export const searchLimiter = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 searches per minute
  message: 'Too many search requests, please try again later.',
  skipSuccessfulRequests: true
});

// IP whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized to access this endpoint'
      });
    }
  };
};

// Request size limiter
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return express.json({ 
    limit: maxSize,
    verify: (req: any, res, buf) => {
      // Additional validation can be added here
      if (buf.length > parseInt(maxSize.replace('mb', '')) * 1024 * 1024) {
        throw new Error('Request too large');
      }
    }
  });
};

// Input sanitization middleware
export const sanitizeInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value
          .replace(/[<>]/g, '') // Remove HTML tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim();
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://nftflow.io',
      'https://www.nftflow.io',
      'https://app.nftflow.io'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security headers for specific routes
export const strictSecurityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'no-referrer' }
});

// Request logging middleware
export const securityLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    };
    
    // Log suspicious activity
    if (res.statusCode >= 400) {
      console.warn('Security Warning:', logData);
    }
    
    // Log all requests for monitoring
    console.log('Request:', logData);
  });
  
  next();
};

// Error handling middleware
export const securityErrorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Log security-related errors
  if (err.name === 'UnauthorizedError' || err.message.includes('CORS')) {
    console.error('Security Error:', {
      timestamp: new Date().toISOString(),
      error: err.message,
      ip: req.ip,
      url: req.url,
      userAgent: req.get('User-Agent')
    });
  }
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
};

// Export all middleware
export default {
  securityHeaders,
  apiLimiter,
  authLimiter,
  profileUpdateLimiter,
  postCreationLimiter,
  transactionLimiter,
  searchLimiter,
  ipWhitelist,
  requestSizeLimiter,
  sanitizeInput,
  corsOptions,
  strictSecurityHeaders,
  securityLogger,
  securityErrorHandler
};
