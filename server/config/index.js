require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  enquiryRateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit enquiry submissions to 10 per hour per IP
  },
};

module.exports = config;
