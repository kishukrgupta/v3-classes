require('dotenv').config();

// ── Validate required environment variables ──
const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
];

const REQUIRED_IN_PRODUCTION = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FRONTEND_URL',
];

const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (process.env.NODE_ENV === 'production') {
  missing.push(...REQUIRED_IN_PRODUCTION.filter((v) => !process.env[v]));
}

if (missing.length > 0) {
  console.error('═══════════════════════════════════════════════════');
  console.error('  FATAL: Missing required environment variables:');
  missing.forEach((v) => console.error(`    - ${v}`));
  console.error('');
  console.error('  Copy .env.example to .env and fill in real values.');
  console.error('═══════════════════════════════════════════════════');
  process.exit(1);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
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

  // CORS — support comma-separated FRONTEND_URL for multiple origins
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
