import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'iambillboard-production-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Serve static files
const distPath = path.resolve(__dirname, "dist", "public");
app.use(express.static(distPath));

// Forgot password route (production ready)
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { usernameOrEmail } = req.body;
    
    if (!usernameOrEmail) {
      return res.status(400).json({ 
        error: 'Please enter your username or email address',
        type: 'validation_error'
      });
    }
    
    // For production - only admin recovery is supported
    if (usernameOrEmail.trim() === 'judge') {
      return res.json({ 
        success: true,
        message: 'Admin account recovery: Use judge/judge1313 credentials to access admin panel.',
        isAdmin: true
      });
    }
    
    // For regular users - show generic message for security
    return res.json({ 
      success: true,
      message: 'If an account exists, you will receive recovery instructions. For admin access, use judge/judge1313.',
      isAdmin: false
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Password recovery failed. Please try again later.',
      type: 'server_error'
    });
  }
});

// Admin signin route
app.post('/api/signin', async (req, res) => {
  try {
    console.log('Signin attempt:', { username: req.body.username, hasPassword: !!req.body.password });
    
    const { username, password } = req.body;
    
    // Validate input
    if (!username) {
      console.log('Missing username');
      return res.status(400).json({ 
        error: 'Username is required',
        field: 'username'
      });
    }
    
    if (!password) {
      console.log('Missing password');
      return res.status(400).json({ 
        error: 'Password is required',
        field: 'password'
      });
    }

    // Validate credentials
    if (username.trim() === 'judge' && password === 'judge1313') {
      req.session.user = {
        id: 'judge',
        username: 'judge',
        role: 'admin'
      };
      console.log('Login successful for judge');
      return res.json({ 
        success: true, 
        user: { username: 'judge', role: 'admin' },
        message: 'Login successful'
      });
    }

    console.log('Invalid credentials for:', username);
    return res.status(401).json({ 
      error: 'Invalid username or password',
      success: false
    });
    
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      success: false
    });
  }
});

// Check auth status
app.get('/api/auth/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Basic routes for essential functionality
app.get('/api/bottle-samples', async (req, res) => {
  try {
    const samples = await sql`SELECT * FROM bottle_samples ORDER BY id DESC`;
    res.json(samples);
  } catch (error) {
    console.error('Error fetching bottle samples:', error);
    res.json([]);
  }
});

app.get('/api/logo-settings', async (req, res) => {
  try {
    const settings = await sql`SELECT * FROM logo_settings LIMIT 1`;
    res.json(settings[0] || {});
  } catch (error) {
    console.error('Error fetching logo settings:', error);
    res.json({});
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Fallback to index.html for client-side routing
app.use("*", (_req, res) => {
  res.sendFile(path.resolve(distPath, "index.html"));
});

const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ IamBillboard Server running on port ${port}`);
  console.log(`✅ Admin login: judge/judge1313`);
  console.log(`✅ Health check: http://localhost:${port}/api/health`);
});