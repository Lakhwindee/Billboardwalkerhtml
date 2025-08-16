import express from 'express';
import path from 'path';
import pg from 'pg';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'iambillboard-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Simple hardcoded check for judge user
    if (username === 'judge' && password === 'judge1313') {
      (req.session as any).user = {
        id: 1,
        username: 'judge',
        email: 'admin@iambillboard.com',
        role: 'admin'
      };
      
      return res.json({
        message: 'Login successful',
        user: {
          id: 1,
          username: 'judge',
          email: 'admin@iambillboard.com',
          role: 'admin'
        }
      });
    }
    
    res.status(401).json({ error: 'Invalid username or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check auth
app.get('/api/auth/check', (req, res) => {
  if ((req.session as any).user) {
    res.json({ user: (req.session as any).user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {});
  res.json({ message: 'Logged out' });
});

// Basic API endpoints
app.get('/api/bottle-samples', (req, res) => {
  res.json([]);
});

app.get('/api/logo-settings', (req, res) => {
  res.json([]);
});

app.post('/api/visitors/track', (req, res) => {
  res.json({ success: true });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist/public')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'production');
});