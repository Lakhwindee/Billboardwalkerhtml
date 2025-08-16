// Production startup script
import express from 'express';
import { createServer } from 'http';
import path from 'path';

const app = express();

// Add CORS
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple login test endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'judge' && password === 'judge1313') {
    res.json({
      message: 'Login successful',
      user: {
        id: 1,
        username: 'judge',
        email: 'admin@iambillboard.com',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      error: 'Wrong username or password. Please check your credentials.',
      type: 'invalid_credentials'
    });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/public')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

const port = process.env.PORT || 5000;
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});