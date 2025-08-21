import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Add CORS headers for production deployment (must be before other middleware)
app.use((req, res, next) => {
  // For credentials to work, we need specific origin instead of *
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'https://iambillboard.com',
    'https://www.iambillboard.com'
  ];
  
  if (allowedOrigins.includes(origin as string) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || 'http://localhost:5000');
  }
  
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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Ensure NODE_ENV is properly set for production
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Add health check endpoint before route registration
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT || '5000'
  });
});

// Add startup health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Main server initialization with proper error handling
async function startServer() {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Server Error:', err);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    return new Promise<void>((resolve, reject) => {
      const serverInstance = server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        log(`serving on port ${port}`);
        log(`Environment: ${process.env.NODE_ENV}`);
        log(`API endpoints available at http://0.0.0.0:${port}/api/*`);
        log(`Health check available at http://0.0.0.0:${port}/health`);
        resolve();
      });

      // Handle server errors
      serverInstance.on('error', (err) => {
        console.error('Server error:', err);
        reject(err);
      });

      // Graceful shutdown handling
      process.on('SIGTERM', () => {
        log('SIGTERM received, shutting down gracefully');
        serverInstance.close(() => {
          log('Server closed');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        log('SIGINT received, shutting down gracefully');
        serverInstance.close(() => {
          log('Server closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Start the server with error handling
startServer().catch((error) => {
  console.error('Fatal server startup error:', error);
  process.exit(1);
});
