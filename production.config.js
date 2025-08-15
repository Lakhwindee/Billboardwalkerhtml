// Production configuration for Replit deployment
module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  host: '0.0.0.0',
  
  // Environment settings
  environment: 'production',
  
  // Database configuration (uses Replit PostgreSQL)
  database: {
    url: process.env.DATABASE_URL
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'iambillboard-production-secret-2025',
    secure: true, // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // CORS settings for production
  cors: {
    origin: true, // Allow all origins for flexibility
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  }
};