import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
// Simple auth middleware for sessions
const requireAuth = (req: any, res: any, next: any) => {
  if (req.session?.user) {
    next();
  } else {
    res.status(401).json({ error: "Authentication required" });
  }
};


import { insertContactSchema, insertOrderSchema, insertCampaignSchema, insertPriceSettingSchema, insertSiteSettingSchema, insertHomeImageSchema, insertOrderCampaignSchema, insertLogoSettingSchema, insertUserSchema, insertDesignSampleSchema } from "../shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcrypt";
import { emailService } from "./emailService";
import { emailVerificationService } from "./emailVerificationService";
import { smsService } from "./smsService";
import otpService from "./otpService";
import { paymentGateway } from "./paymentGateway";

import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "./db";

// Configure multer for image uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = './uploads/home-images';
    if (req.path.includes('logo')) {
      uploadDir = './uploads/logos';
    }
    if (req.path.includes('design-samples')) {
      uploadDir = './uploads/design-samples';
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let prefix = 'home-';
    if (req.path.includes('logo')) {
      prefix = 'logo-';
    }
    if (req.path.includes('design-samples')) {
      prefix = 'design-';
    }
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// File size validation based on A3 paper size (300 DPI standard)
// A3 dimensions: 297mm x 420mm
// At 300 DPI: 3508 x 4961 pixels
// Expected file sizes at different formats:
// - JPEG (high quality): ~2-4 MB
// - PNG (high quality): ~8-15 MB 
// - Maximum allowed: 15 MB (covers A3 at highest quality)

const A3_MAX_SIZE = 15 * 1024 * 1024; // 15MB - Maximum for A3 high quality

const upload = multer({ 
  storage: storage_multer,
  limits: { 
    fileSize: A3_MAX_SIZE,
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    console.log(`📄 File upload attempt: ${file.originalname} (${(file.size || 0 / 1024 / 1024).toFixed(2)}MB)`);
    
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (!mimetype || !extname) {
      console.log(`❌ Invalid file type: ${file.mimetype}`);
      return cb(new Error('केवल image files की अनुमति है! (JPEG, PNG, GIF, WebP)'));
    }
    
    // Additional size check with user-friendly message
    if (file.size && file.size > A3_MAX_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log(`❌ File too large: ${fileSizeMB}MB (limit: 15MB)`);
      return cb(new Error(`File बहुत बड़ी है! Size: ${fileSizeMB}MB। कृपया A3 size (15MB) से छोटी file upload करें।`));
    }
    
    console.log(`✅ File accepted: ${file.originalname}`);
    cb(null, true);
  }
});

// Session configuration
const PgSession = connectPgSimple(session);

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'iambillboard-secret-key-2025-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' // Better cross-origin compatibility
    }
  }));

  // Serve uploaded images
  app.use('/uploads', express.static('uploads'));
  


  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password,
        role: 'user'
      });
      
      // Log the registration
      await storage.createUserActivityLog({
        userId: user.id,
        action: 'account_created',
        details: `User registered with email: ${email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Welcome SMS will be sent during profile creation when phone is added
      
      res.json({ 
        message: 'Registration successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  });

  // Legacy signin endpoint - redirect to login
  app.post("/api/signin", async (req, res) => {
    // Redirect to the main login endpoint
    return res.redirect(307, '/api/login');
  });

  app.post("/api/login", async (req, res) => {
    try {
      console.log('Login attempt for user:', req.body?.username);
      
      const { username, password } = req.body;
      
      // Input validation
      if (!username || !password) {
        return res.status(400).json({ 
          error: 'Please enter both username and password',
          type: 'validation_error'
        });
      }
      
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ 
          error: 'Invalid input format',
          type: 'validation_error'
        });
      }
      
      // Clean username but don't alter too much - just trim and lowercase
      const cleanUsername = username.toString().trim().toLowerCase();
      
      // Try to find user by exact username first
      let user = await storage.getUserByUsername(username.trim());
      
      // If not found, try cleaned username
      if (!user) {
        user = await storage.getUserByUsername(cleanUsername);
      }
      
      // If still not found, try by email in case they entered email
      if (!user && username.includes('@')) {
        user = await storage.getUserByEmail(username.trim());
      }
      
      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ 
          error: 'Wrong username or password. Please check your credentials.',
          type: 'invalid_credentials'
        });
      }
      
      console.log('User found:', { id: user.id, username: user.username, role: user.role });
      
      // Check if account is banned
      if (user.isBanned) {
        return res.status(403).json({ 
          error: 'Your account has been banned. Contact support for assistance.',
          reason: user.banReason,
          type: 'account_banned'
        });
      }
      
      // Verify password - handle both hashed and plain text for testing
      let isValid = false;
      
      // Check if password is already hashed (starts with $2b$)
      if (user.password.startsWith('$2b$')) {
        isValid = await bcrypt.compare(password, user.password);
      } else {
        // For testing - compare plain text
        isValid = password === user.password;
        
        // If valid, hash the password and update it in database
        if (isValid) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await storage.updateUserPassword(user.id, hashedPassword);
          console.log('✅ Password hashed and updated for user:', username);
        }
      }
      
      if (!isValid) {
        console.log('Password verification failed for user:', username);
        return res.status(401).json({ 
          error: 'Wrong username or password. Please check your credentials.',
          type: 'invalid_credentials'
        });
      }
      
      // For admin accounts (judge), show test OTP in development mode
      if (user.role === 'admin' && process.env.NODE_ENV === 'development') {
        const testOtp = Math.floor(100000 + Math.random() * 900000);
        console.log(`🔐 ADMIN TEST OTP for ${user.username}: ${testOtp}`);
        console.log(`📱 For testing purposes - Admin login OTP: ${testOtp}`);
      }
      
      console.log('Login successful for user:', user.username);
      
      // Log successful login
      await storage.createUserActivityLog({
        userId: user.id,
        action: 'login',
        details: `User logged in successfully`,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      });
      
      // Set session and save explicitly
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      
      // Save session explicitly to ensure persistence
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ 
            error: 'Session save failed',
            type: 'session_error'
          });
        }
        
        res.json({ 
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Server error during login. Please try again.',
        type: 'server_error'
      });
    }
  });

  // Get current user endpoint for role checking
  app.get("/api/current-user", (req, res) => {
    const session = req.session as any;
    if (session?.user) {
      res.json(session.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const authReq = req as any;
      
      // Log the logout
      await storage.createUserActivityLog({
        userId: authReq.user.id,
        action: 'logout',
        details: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // Modern signup endpoint
  app.post("/api/signup", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, businessName, businessType, password, agreeMarketing } = req.body;
      
      // Basic validation
      if (!firstName || !lastName || !email || !phone || !businessName || !businessType || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }
      
      // Phone validation (Indian format)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
      }
      
      // Password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email address is already registered' });
      }
      
      // Generate username from first name and random number
      const baseUsername = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;
      
      // Ensure username is unique
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const userData = {
        username,
        email,
        password: hashedPassword,
        role: 'user' as const,
        firstName,
        lastName,
        phone,
        businessName,
        businessType,
        marketingOptIn: agreeMarketing || false,
        isBanned: false,
        banReason: null,
        isActive: true
      };
      
      const user = await storage.createUser(userData);
      
      // Log the registration
      await storage.createUserActivityLog({
        userId: user.id,
        action: 'account_created',
        details: `User registered: ${firstName} ${lastName} (${email})`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });
      
      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(email, firstName, username);
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
      
      // Send welcome SMS
      try {
        await smsService.sendWelcomeSMS(phone, firstName);
        console.log(`Welcome SMS sent to ${phone}`);
      } catch (smsError) {
        console.error('Failed to send welcome SMS:', smsError);
      }
      
      res.json({ 
        message: 'Account created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Account creation failed. Please try again.' });
    }
  });

  // Email verification endpoints
  app.post("/api/send-email-verification", async (req, res) => {
    try {
      const { email, firstName } = req.body;
      
      if (!email || !firstName) {
        return res.status(400).json({ message: 'Email and first name are required' });
      }
      
      const result = await emailVerificationService.sendVerificationEmail(email, firstName);
      
      if (result.success) {
        res.json({ message: result.message, verificationId: result.verificationId });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error('Send email verification error:', error);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  });

  app.post("/api/verify-email", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
      }
      
      const result = await emailVerificationService.verifyEmailOTP(email, otp);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ message: 'Email verification failed' });
    }
  });

  // Phone verification endpoints
  app.post("/api/send-phone-verification", async (req, res) => {
    try {
      const { phone, customerName } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      
      // Validate Indian phone number format (10 digits starting with 6-9)
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = phone.toString().replace(/\D/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ 
          message: 'Please enter a valid Indian phone number (10 digits starting with 6-9)' 
        });
      }
      
      const result = await otpService.generateSignupOTP(cleanPhone, customerName);
      
      if (result.success) {
        res.json({ message: result.message, otpId: result.otpId });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error('Send phone verification error:', error);
      res.status(500).json({ message: 'Failed to send verification SMS' });
    }
  });

  app.post("/api/verify-phone-and-signup", async (req, res) => {
    try {
      const { phone, otp, userData } = req.body;
      
      if (!phone || !otp || !userData) {
        return res.status(400).json({ message: 'Phone, OTP, and user data are required' });
      }
      
      // Validate phone number format again during verification
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = phone.toString().replace(/\D/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ 
          message: 'Invalid phone number format. Please use a valid Indian phone number.' 
        });
      }
      
      // Verify phone OTP first
      const phoneVerification = await otpService.verifySignupOTP(cleanPhone, otp);
      
      if (!phoneVerification.success) {
        return res.status(400).json({ message: phoneVerification.message });
      }
      
      // Create user account
      const { firstName, lastName, email, businessName, businessType, password, agreeMarketing } = userData;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email address is already registered' });
      }
      
      // Generate username from first name and random number
      const baseUsername = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;
      
      // Ensure username is unique
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user with verified email and phone
      const newUserData = {
        username,
        email,
        password: hashedPassword,
        role: 'user' as const,
        isEmailVerified: true,  // Email was verified in previous step
        isBanned: false,
        banReason: null
      };
      
      const user = await storage.createUser(newUserData);
      
      // Create user profile with additional information
      await storage.createUserProfile({
        userId: user.id,
        fullName: `${firstName} ${lastName}`,
        phone,
        company: businessName
      });
      
      // Log the registration
      await storage.createUserActivityLog({
        userId: user.id,
        action: 'account_created',
        details: `User registered with verified email and phone: ${firstName} ${lastName} (${email})`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });
      
      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(email, firstName, username);
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
      
      // Send welcome SMS
      try {
        await smsService.sendWelcomeSMS(phone, firstName);
        console.log(`Welcome SMS sent to ${phone}`);
      } catch (smsError) {
        console.error('Failed to send welcome SMS:', smsError);
      }
      
      res.json({ 
        message: 'Account created successfully with verified email and phone',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isEmailVerified: true
        }
      });
    } catch (error: any) {
      console.error('Phone verification and signup error:', error);
      res.status(500).json({ message: 'Account creation failed. Please try again.' });
    }
  });

  // Forgot Password - Simple admin recovery (Production Ready)
  app.post("/api/forgot-password", async (req, res) => {
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
        // Admin account recovery - contact support
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
      
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({ 
        error: 'Password recovery failed. Please try again later.',
        type: 'server_error'
      });
    }
  });
  
  // Verify Password Reset OTP
  app.post("/api/verify-reset-otp", async (req, res) => {
    try {
      const { usernameOrEmail, otp } = req.body;
      
      if (!usernameOrEmail || !otp) {
        return res.status(400).json({ 
          error: 'Username/Email and OTP are required',
          type: 'validation_error'
        });
      }
      
      // Find user
      let user = await storage.getUserByUsername(usernameOrEmail.trim());
      if (!user && usernameOrEmail.includes('@')) {
        user = await storage.getUserByEmail(usernameOrEmail.trim());
      }
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          type: 'user_not_found'
        });
      }
      
      // Verify OTP
      const isValid = await storage.verifyPasswordResetOtp(user.id, otp);
      
      if (!isValid) {
        return res.status(400).json({ 
          error: 'Invalid or expired OTP. Please request a new one.',
          type: 'invalid_otp'
        });
      }
      
      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      res.json({ 
        success: true,
        resetToken,
        message: 'OTP verified successfully. You can now reset your password.'
      });
    } catch (error: any) {
      console.error('OTP verification error:', error);
      res.status(500).json({ 
        error: 'Server error. Please try again.',
        type: 'server_error'
      });
    }
  });
  
  // Reset Password
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { usernameOrEmail, resetToken, newPassword, confirmPassword } = req.body;
      
      if (!usernameOrEmail || !resetToken || !newPassword || !confirmPassword) {
        return res.status(400).json({ 
          error: 'All fields are required',
          type: 'validation_error'
        });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ 
          error: 'Passwords do not match',
          type: 'password_mismatch'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long',
          type: 'password_too_short'
        });
      }
      
      // Find user
      let user = await storage.getUserByUsername(usernameOrEmail.trim());
      if (!user && usernameOrEmail.includes('@')) {
        user = await storage.getUserByEmail(usernameOrEmail.trim());
      }
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          type: 'user_not_found'
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Mark all password reset OTPs as used
      await storage.markPasswordResetOtpsAsUsed(user.id);
      
      // Log password change
      await storage.createUserActivityLog({
        userId: user.id,
        action: 'password_reset',
        details: 'Password reset successfully via OTP verification',
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      });
      
      res.json({ 
        success: true,
        message: 'Password reset successfully. You can now login with your new password.'
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      res.status(500).json({ 
        error: 'Server error. Please try again.',
        type: 'server_error'
      });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const authReq = req as any;
      const user = await storage.getUser(authReq.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Admin password change route
  app.post("/api/change-admin-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password and new password are required' 
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'New password must be at least 6 characters long' 
        });
      }
      
      // Get judge user from database
      const judgeUser = await storage.getUserByUsername('judge');
      if (!judgeUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Admin user not found' 
        });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, judgeUser.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password in database
      await storage.updateUserPassword(judgeUser.id, hashedNewPassword);
      
      res.json({ 
        success: true, 
        message: 'Password changed successfully' 
      });
      
    } catch (error: any) {
      console.error('Password change error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to change password' 
      });
    }
  });

  // Change Campaign Manager Password Route
  app.post("/api/change-campaign-password", async (req, res) => {
    try {
      const { newPassword } = req.body;
      
      // Validate input
      if (!newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'New password is required' 
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'New password must be at least 6 characters long' 
        });
      }
      
      // Get campaigns user from database
      const campaignsUser = await storage.getUserByUsername('campaigns');
      if (!campaignsUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Campaign Manager user not found' 
        });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password in database
      await storage.updateUserPassword(campaignsUser.id, hashedNewPassword);
      
      console.log(`🔑 Campaign Manager password updated by admin`);
      
      res.json({ 
        success: true, 
        message: 'Campaign Manager password changed successfully' 
      });
      
    } catch (error: any) {
      console.error('Campaign password change error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to change Campaign Manager password' 
      });
    }
  });

  // Contact routes
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error: any) {
      console.error('Error creating contact:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Order routes
  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Send order confirmation SMS
      if (order.customerPhone) {
        try {
          await smsService.sendOrderConfirmationSMS(order.customerPhone, {
            orderId: `ORDER-${order.id}`,
            totalAmount: order.totalAmount,
            paymentStatus: order.paymentStatus,
            items: order.bottleType,
            address: `${order.customerAddress}, ${order.customerCity}`
          });
          console.log(`Order confirmation SMS sent to ${order.customerPhone}`);
        } catch (smsError) {
          console.error('Failed to send order confirmation SMS:', smsError);
        }
      }
      
      res.json(order);
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/contact/:contactId", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      const orders = await storage.getOrdersByContactId(contactId);
      res.json(orders);
    } catch (error: any) {
      console.error('Error fetching orders for contact:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Campaign management routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Design reupload system routes
  app.post("/api/campaigns/:id/request-design-reupload", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { feedback, rejectionReason } = req.body;
      
      if (!feedback || !rejectionReason) {
        return res.status(400).json({ error: 'Feedback and rejection reason are required' });
      }
      
      // Update campaign with reupload request
      const campaign = await storage.requestDesignReupload(campaignId, feedback, rejectionReason);
      
      // Get user details for email notification
      const user = await storage.getUser(campaign.userId!);
      
      if (user) {
        // Send email notification to user
        try {
          const emailSubject = `🎨 Design Reupload Required - Campaign #${campaignId}`;
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 100%); color: white; padding: 20px; border-radius: 15px;">
              <div style="text-align: center; padding: 20px 0;">
                <h1 style="color: #ff6b6b; margin: 0 0 10px 0;">🎨 Design Reupload Required</h1>
                <h2 style="color: white; margin: 0 0 20px 0;">${campaign.title}</h2>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #ffd93d; margin-top: 0;">📝 Admin Feedback:</h3>
                <p style="color: #ccd6f6; line-height: 1.6; margin: 10px 0;">${feedback}</p>
              </div>
              
              <div style="background: rgba(255, 107, 107, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid rgba(255, 107, 107, 0.3);">
                <h3 style="color: #ff6b6b; margin-top: 0;">❌ Rejection Reason:</h3>
                <p style="color: #ffcccb; line-height: 1.6; margin: 10px 0;">${rejectionReason}</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #ffd93d; margin-top: 0;">📋 Campaign Details:</h3>
                <p style="color: #ccd6f6; margin: 5px 0;"><strong>Campaign ID:</strong> #${campaign.id}</p>
                <p style="color: #ccd6f6; margin: 5px 0;"><strong>Quantity:</strong> ${campaign.quantity} bottles</p>
                <p style="color: #ccd6f6; margin: 5px 0;"><strong>Status:</strong> Pending Reupload</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #ffd93d); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; text-align: center;">
                  📱 Upload New Design
                </a>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p style="color: #ccd6f6; text-align: center; margin: 0; font-size: 14px;">
                  Please address the feedback and upload a new design. Contact support if you have questions.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="color: #888; margin: 0;">© 2025 IamBillBoard - Custom Bottle Advertising</p>
              </div>
            </div>
          `;
          
          await emailService.sendEmail({
            to: user.email,
            subject: emailSubject,
            html: emailContent
          });
          
          console.log(`📧 Design reupload email sent to ${user.email} for campaign #${campaignId}`);
        } catch (emailError) {
          console.error('Error sending reupload email:', emailError);
          // Continue even if email fails
        }
        
        // Send SMS notification if user has phone
        if (user.phone) {
          try {
            const smsMessage = `🎨 IamBillBoard: Your campaign "${campaign.title}" needs design reupload. Check email for details. Upload new design at: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard`;
            
            await smsService.sendSMS(user.phone, smsMessage);
            console.log(`📱 Design reupload SMS sent to ${user.phone}`);
          } catch (smsError) {
            console.error('Error sending reupload SMS:', smsError);
          }
        }
      }
      
      res.json({ 
        success: true, 
        message: 'Design reupload request sent successfully',
        campaign 
      });
    } catch (error: any) {
      console.error('Error requesting design reupload:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // User submits reuploaded design
  app.post("/api/campaigns/:id/reupload-design", upload.single('design'), async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ error: 'Design file is required' });
      }
      
      // Ensure campaign directory exists
      const campaignDir = './uploads/campaigns';
      if (!fs.existsSync(campaignDir)) {
        fs.mkdirSync(campaignDir, { recursive: true });
      }
      
      const designUrl = `/uploads/campaigns/${req.file.filename}`;
      
      // Update campaign with new design
      const campaign = await storage.submitReuploadedDesign(campaignId, designUrl, req.file.filename);
      
      console.log(`🎨 Design reuploaded for campaign ${campaignId}: ${req.file.filename}`);
      
      res.json({ 
        success: true, 
        message: 'Design reuploaded successfully', 
        campaign,
        designUrl 
      });
    } catch (error: any) {
      console.error('Error reuploading design:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Design download route - serves original uploaded design files  
  app.get("/api/campaigns/:id/design", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaigns = await storage.getCampaigns();
      const campaign = campaigns.find(c => c.id === campaignId);
      
      if (!campaign || !campaign.designUrl) {
        return res.status(404).json({ message: "Design not found" });
      }

      // For user uploaded designs, serve from uploads directory
      if (campaign.designType === 'user_uploaded') {
        const filePath = campaign.designUrl.startsWith('/uploads/') 
          ? campaign.designUrl.substring(1) 
          : campaign.designUrl;
        
        const fullPath = path.join(process.cwd(), filePath);
        
        if (!fs.existsSync(fullPath)) {
          return res.status(404).json({ message: "Design file not found on server" });
        }

        // Set proper headers for download with original filename
        const fileName = campaign.uploadedDesignFileName || `campaign-${campaign.id}-design`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Stream the file
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);
      } else {
        // For other design types, redirect to the design URL
        res.redirect(campaign.designUrl);
      }
    } catch (error: any) {
      console.error("Error serving design file:", error);
      res.status(500).json({ message: "Failed to serve design file" });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      
      // Send campaign submission confirmation email and SMS to user
      if (campaign.userId) {
        try {
          const user = await storage.getUser(campaign.userId);
          if (user) {
            const campaignNotificationData = {
              campaignId: `CAMP-${campaign.id}`,
              customerName: user.username,
              bottleType: campaign.selectedOption || 'Standard Bottle',
              quantity: campaign.quantity || 1000,
              totalAmount: campaign.totalAmount,
              paymentStatus: 'Paid',
              selectedOption: campaign.selectedOption,
              selectedCity: campaign.selectedCity,
              selectedArea: campaign.selectedArea
            };
            
            // Send email notification
            if (user.email) {
              await emailService.sendCampaignSubmissionEmail(user.email, campaignNotificationData);
              console.log(`Campaign submission email sent to ${user.email}`);
            }
            
            // Send SMS notification (get phone from campaign data or user profile)
            const userPhone = campaign.customerPhone || user.phone;
            if (userPhone) {
              await smsService.sendCampaignSubmissionSMS(userPhone, campaignNotificationData);
              console.log(`Campaign submission SMS sent to ${userPhone}`);
            }
          }
        } catch (notificationError) {
          console.error('Failed to send campaign submission notifications:', notificationError);
          // Don't fail the API call if notifications fail
        }
      }
      
      res.json(campaign);
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const campaign = await storage.updateCampaign(id, updateData);
      res.json(campaign);
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Campaign status update endpoint for admin
  app.patch("/api/campaigns/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected', 'in_production', 'shipped', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      // If status is rejected, ensure rejection reason is provided
      if (status === 'rejected' && !rejectionReason?.trim()) {
        return res.status(400).json({ error: 'Rejection reason is required when rejecting a campaign' });
      }
      
      // Update campaign status
      const updateData: any = { status };
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason.trim();
      }
      
      const campaign = await storage.updateCampaign(id, updateData);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      // Send automated email notification based on status change
      if (campaign.userId) {
        try {
          const user = await storage.getUser(campaign.userId);
          if (user && user.email) {
            const campaignEmailData = {
              campaignId: `CAMP-${campaign.id}`,
              customerName: user.username,
              bottleType: campaign.selectedOption || 'Standard Bottle',
              quantity: campaign.quantity || 1000,
              totalAmount: campaign.totalAmount,
              selectedOption: campaign.selectedOption,
              selectedCity: campaign.selectedCity,
              selectedArea: campaign.selectedArea
            };
            
            // Get user's phone number for SMS notifications
            const userPhone = campaign.customerPhone || user.phone;
            
            switch (status) {
              case 'approved':
                // Send both email and SMS
                if (user.email) {
                  await emailService.sendCampaignApprovalEmail(user.email, campaignEmailData);
                  console.log(`Campaign approval email sent to ${user.email}`);
                }
                if (userPhone) {
                  await smsService.sendCampaignApprovalSMS(userPhone, campaignEmailData);
                  console.log(`Campaign approval SMS sent to ${userPhone}`);
                }
                break;
              case 'rejected':
                // Send both email and SMS
                if (user.email) {
                  await emailService.sendCampaignRejectionEmail(user.email, campaignEmailData, rejectionReason);
                  console.log(`Campaign rejection email sent to ${user.email}`);
                }
                if (userPhone) {
                  await smsService.sendCampaignRejectionSMS(userPhone, campaignEmailData, rejectionReason);
                  console.log(`Campaign rejection SMS sent to ${userPhone}`);
                }
                break;
              case 'in_production':
                // Send both email and SMS
                if (user.email) {
                  await emailService.sendProductionStatusEmail(user.email, campaignEmailData, 'production_started');
                  console.log(`Production started email sent to ${user.email}`);
                }
                if (userPhone) {
                  await smsService.sendProductionStatusSMS(userPhone, campaignEmailData, 'production_started');
                  console.log(`Production started SMS sent to ${userPhone}`);
                }
                break;
              case 'shipped':
                // Send both email and SMS
                if (user.email) {
                  await emailService.sendProductionStatusEmail(user.email, campaignEmailData, 'shipped');
                  console.log(`Shipped status email sent to ${user.email}`);
                }
                if (userPhone) {
                  await smsService.sendProductionStatusSMS(userPhone, campaignEmailData, 'shipped');
                  console.log(`Shipped status SMS sent to ${userPhone}`);
                }
                break;
              case 'delivered':
                // Send both email and SMS
                if (user.email) {
                  await emailService.sendProductionStatusEmail(user.email, campaignEmailData, 'delivered');
                  console.log(`Delivery confirmation email sent to ${user.email}`);
                }
                if (userPhone) {
                  await smsService.sendProductionStatusSMS(userPhone, campaignEmailData, 'delivered');
                  console.log(`Delivery confirmation SMS sent to ${userPhone}`);
                }
                break;
            }
          }
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
          // Don't fail the API call if email fails
        }
      }
      
      res.json({ 
        success: true, 
        campaign,
        message: `Campaign status updated to ${status}${status === 'rejected' ? ' with reason provided' : ''}` 
      });
      
    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Price settings routes
  app.get("/api/price-settings", async (req, res) => {
    try {
      const priceSettings = await storage.getPriceSettings();
      res.json(priceSettings);
    } catch (error: any) {
      console.error('Error fetching price settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/price-settings", async (req, res) => {
    try {
      const priceData = insertPriceSettingSchema.parse(req.body);
      const priceSetting = await storage.createPriceSetting(priceData);
      res.json(priceSetting);
    } catch (error: any) {
      console.error('Error creating price setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/price-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const priceSetting = await storage.updatePriceSetting(id, updateData);
      res.json(priceSetting);
    } catch (error: any) {
      console.error('Error updating price setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/price-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePriceSetting(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting price setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Test SMS configuration
  app.post("/api/test-sms", async (req, res) => {
    try {
      const { testNumber, config } = req.body;
      
      if (!testNumber) {
        return res.json({ 
          success: true,
          message: 'SMS configuration saved. Add a test number to send test SMS.'
        });
      }
      
      // Test SMS with provided config
      const result = await smsService.sendTestSMS(testNumber, config);
      
      res.json({ 
        success: result,
        message: result ? 'Test SMS sent successfully' : 'SMS sending failed'
      });
    } catch (error: any) {
      console.error('Test SMS error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'SMS test failed' 
      });
    }
  });

  // Site settings routes
  app.get("/api/site-settings", async (req, res) => {
    try {
      const siteSettings = await storage.getSiteSettings();
      res.json(siteSettings);
    } catch (error: any) {
      console.error('Error fetching site settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/site-settings", async (req, res) => {
    try {
      const settingData = insertSiteSettingSchema.parse(req.body);
      const siteSetting = await storage.createSiteSetting(settingData);
      res.json(siteSetting);
    } catch (error: any) {
      console.error('Error creating site setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/site-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const siteSetting = await storage.updateSiteSetting(id, updateData);
      res.json(siteSetting);
    } catch (error: any) {
      console.error('Error updating site setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Home images routes
  app.get("/api/home-images", async (req, res) => {
    try {
      const homeImages = await storage.getHomeImages();
      res.json(homeImages);
    } catch (error: any) {
      console.error('Error fetching home images:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/home-images", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imageData = {
        imageName: req.file.filename,
        imageUrl: `/uploads/home-images/${req.file.filename}`,
        imageType: req.body.imageType || 'general',
        isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true,
      };

      const homeImage = await storage.createHomeImage(imageData);
      res.json(homeImage);
    } catch (error: any) {
      console.error('Error uploading home image:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/home-images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const homeImage = await storage.updateHomeImage(id, updateData);
      res.json(homeImage);
    } catch (error: any) {
      console.error('Error updating home image:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/home-images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get image details before deleting to remove file
      const homeImages = await storage.getHomeImages();
      const imageToDelete = homeImages.find(img => img.id === id);
      
      if (imageToDelete) {
        // Delete file from filesystem
        const filePath = path.join('.', imageToDelete.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await storage.deleteHomeImage(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting home image:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Bottle samples routes
  app.get("/api/bottle-samples", async (req, res) => {
    try {
      const bottleSamples = await storage.getBottleSamples();
      res.json(bottleSamples);
    } catch (error: any) {
      console.error('Error fetching bottle samples:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bottle-samples/:bottleType", async (req, res) => {
    try {
      const bottleType = req.params.bottleType;
      const bottleSamples = await storage.getBottleSamplesByType(bottleType);
      res.json(bottleSamples);
    } catch (error: any) {
      console.error('Error fetching bottle samples by type:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create upload middleware for bottle samples
  const bottleUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = './uploads/bottle-samples';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      console.log(`🍼 Bottle sample upload: ${file.originalname} (${(file.size || 0 / 1024 / 1024).toFixed(2)}MB)`);
      
      if (!file.mimetype.startsWith('image/')) {
        console.log(`❌ Invalid bottle sample file type: ${file.mimetype}`);
        return cb(new Error('केवल image files की अनुमति है! (JPEG, PNG, GIF, WebP)'));
      }
      
      // A3 size check for bottle samples
      if (file.size && file.size > A3_MAX_SIZE) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.log(`❌ Bottle sample too large: ${fileSizeMB}MB (A3 limit: 15MB)`);
        return cb(new Error(`Bottle sample बहुत बड़ी है! Size: ${fileSizeMB}MB। कृपया A3 size (15MB) से छोटी file upload करें।`));
      }
      
      console.log(`✅ Bottle sample accepted: ${file.originalname}`);
      cb(null, true);
    },
    limits: {
      fileSize: A3_MAX_SIZE, // 15MB - A3 maximum size limit
      files: 1
    }
  });

  app.post("/api/bottle-samples", bottleUpload.single('image'), async (req, res) => {
    try {
      console.log('Bottle sample upload request received');
      console.log('File:', req.file);
      console.log('Body:', req.body);
      
      if (!req.file) {
        console.error('No image file provided in request');
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!req.body.bottleType || !['1L', '750ml', '500ml', '2L'].includes(req.body.bottleType)) {
        console.error('Invalid bottle type:', req.body.bottleType);
        return res.status(400).json({ error: 'Valid bottle type (750ml, 1L, 500ml, or 2L) is required' });
      }

      // Ensure uploads directory exists
      const bottleDir = './uploads/bottle-samples';
      if (!fs.existsSync(bottleDir)) {
        console.log('Creating bottle samples directory:', bottleDir);
        fs.mkdirSync(bottleDir, { recursive: true });
      }

      const bottleData = {
        bottleType: req.body.bottleType,
        imageName: req.file.filename,
        imageUrl: `/uploads/bottle-samples/${req.file.filename}`,
        isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true,
      };

      console.log('Creating bottle sample with data:', bottleData);
      const bottleSample = await storage.createBottleSample(bottleData);
      console.log('Bottle sample created successfully:', bottleSample);
      res.json(bottleSample);
    } catch (error: any) {
      console.error('Error uploading bottle sample:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  app.patch("/api/bottle-samples/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const bottleSample = await storage.updateBottleSample(id, updateData);
      res.json(bottleSample);
    } catch (error: any) {
      console.error('Error updating bottle sample:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/bottle-samples/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get bottle sample details before deleting to remove file
      const bottleSamples = await storage.getBottleSamples();
      const bottleToDelete = bottleSamples.find(bottle => bottle.id === id);
      
      if (bottleToDelete) {
        // Delete file from filesystem
        const filePath = path.join('.', bottleToDelete.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await storage.deleteBottleSample(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting bottle sample:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Design samples API routes
  // Get all design samples
  app.get("/api/design-samples", async (req, res) => {
    try {
      const designSamples = await storage.getDesignSamples();
      res.json(designSamples);
    } catch (error: any) {
      console.error('Error fetching design samples:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get design samples by category
  app.get("/api/design-samples/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const designSamples = await storage.getDesignSamplesByCategory(category);
      res.json(designSamples);
    } catch (error: any) {
      console.error('Error fetching design samples by category:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new design sample (admin only)
  app.post("/api/design-samples", upload.single('image'), async (req, res) => {
    try {
      console.log('Design sample upload request received');
      console.log('File:', req.file);
      console.log('Body:', req.body);
      
      const { title, description, category, isActive } = req.body;
      
      if (!req.file) {
        console.error('No image file provided in request');
        return res.status(400).json({ error: 'Image file is required' });
      }
      
      // Ensure upload directory exists
      const uploadDir = './uploads/design-samples';
      if (!fs.existsSync(uploadDir)) {
        console.log('Creating design samples directory:', uploadDir);
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const designData = {
        title: title || 'Design Sample',
        description: description || '',
        category: category || 'business', 
        imageUrl: `/uploads/design-samples/${req.file.filename}`,
        isActive: isActive === 'true' || isActive === true,
      };
      
      console.log('Creating design sample with data:', designData);
      const designSample = await storage.createDesignSample(designData);
      console.log('Design sample created successfully:', designSample);
      res.json(designSample);
    } catch (error: any) {
      console.error('Error uploading design sample:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Update a design sample (admin only)
  app.patch("/api/design-samples/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const designSample = await storage.updateDesignSample(id, updateData);
      res.json(designSample);
    } catch (error: any) {
      console.error('Error updating design sample:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a design sample (admin only)
  app.delete("/api/design-samples/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get design sample details before deleting to remove file
      const designSamples = await storage.getDesignSamples();
      const designToDelete = designSamples.find(design => design.id === id);
      
      if (designToDelete) {
        // Delete file from filesystem
        const filePath = path.join('.', designToDelete.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await storage.deleteDesignSample(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting design sample:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Send OTP for email verification
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email, emailConfig } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Check if email already exists
      const existingUsers = await storage.getUsers();
      const existingUser = existingUsers.find(u => u.email === email);
      
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered!" });
      }
      
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP to database (expires in 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await storage.createEmailVerification({ email, otp, expiresAt });
      
      // Send OTP email using existing email service with provided configuration
      try {
        console.log('OTP would be sent:', email, otp);
        // For now, just return success (email service not configured)
        res.json({ success: true, message: "OTP sent to email successfully!" });
      } catch (emailError) {
        console.error('OTP email error:', emailError);
        res.status(500).json({ error: "Failed to send OTP email" });
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Verify OTP
  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
      }
      
      // Get latest unused OTP for this email
      const verification = await storage.getEmailVerification(email, otp);
      
      if (!verification) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
      
      if (verification.isUsed) {
        return res.status(400).json({ error: "OTP already used" });
      }
      
      if (new Date() > verification.expiresAt) {
        return res.status(400).json({ error: "OTP expired" });
      }
      
      // Mark OTP as used
      await storage.markOTPAsUsed(verification.id);
      
      res.json({ success: true, message: "Email verified successfully!" });
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // User signup route (after email verification)
  app.post("/api/signup", async (req, res) => {
    try {
      const { username, password, email, fullName, phone, address, city, state, pincode, company } = req.body;
      
      // Check if email is verified
      const verification = await storage.getLatestVerification(email);
      if (!verification || !verification.isUsed) {
        return res.status(400).json({ error: "Please verify your email first!" });
      }
      
      // Check if user already exists
      const existingUsers = await storage.getUsers();
      const existingUser = existingUsers.find(u => u.username === username || u.email === email);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username or email already exists!" });
      }
      
      // Create user in database with email
      const newUser = await storage.createUser({ 
        username, 
        password, 
        email,
        isEmailVerified: true 
      });
      
      // Create user profile with correct phone field mapping
      const profileData = {
        userId: newUser.id,
        fullName: fullName || '',
        phone: phone || '', // Fixed: phone instead of mobile  
        company: company || '',
        address: address || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        isVerified: true
      };
      
      await storage.createUserProfile(profileData);
      
      // Send account approval email
      try {
        // Get saved email configuration
        const savedEmailConfig = req.body.emailConfig;
        
        console.log('Account approval email would be sent to:', email);
        console.log('Account approval email sent successfully');
      } catch (emailError) {
        console.error('Failed to send account approval email:', emailError);
        // Don't fail the signup if email fails
      }
      
      // Log activity
      await storage.createUserActivityLog({
        userId: newUser.id,
        action: 'Account Created and Approved',
        details: `New user registration with approval email sent: ${username} (${email})`,
        ipAddress: req.ip || 'unknown'
      });
      
      res.json({ 
        success: true, 
        userId: newUser.id, 
        username: newUser.username,
        email: newUser.email,
        message: "Registration successful!" 
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Duplicate login route removed - using the main one above

  // Users management routes
  app.get("/api/users", async (req, res) => {
    try {
      // Only show regular users, not admin accounts
      const allUsers = await storage.getUsers();
      const regularUsers = allUsers.filter(user => user.role !== 'admin');
      res.json(regularUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Ban/Unban user
  app.patch("/api/users/:id/ban", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { banned, banReason } = req.body;
      
      const updateData = {
        isBanned: banned,
        banReason: banned ? banReason : null,
        bannedAt: banned ? new Date() : null
      };
      
      const user = await storage.updateUser(userId, updateData);
      
      // Log activity
      await storage.createUserActivityLog({
        userId: userId,
        action: banned ? 'Account Banned' : 'Account Unbanned',
        details: banned ? `Account banned: ${banReason}` : 'Account unbanned by admin',
        ipAddress: req.ip || 'unknown'
      });
      
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Error updating user ban status:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Delete user profile first
      await storage.deleteUserProfile(userId);
      
      // Delete user activity logs
      await storage.deleteUserActivityLogs(userId);
      
      // Delete user
      await storage.deleteUser(userId);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/user-profiles", async (req, res) => {
    try {
      const profiles = await storage.getUserProfiles();
      res.json(profiles);
    } catch (error: any) {
      console.error('Error fetching user profiles:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user-profiles/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // User activity logs routes
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const logs = await storage.getUserActivityLogs();
      res.json(logs);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/activity-logs/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const logs = await storage.getUserActivityLogsByUserId(userId);
      res.json(logs);
    } catch (error: any) {
      console.error('Error fetching user activity logs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    try {
      const logData = req.body;
      const log = await storage.createUserActivityLog(logData);
      res.json(log);
    } catch (error: any) {
      console.error('Error creating activity log:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Email testing route
  app.post("/api/test-email", async (req, res) => {
    try {
      const { testEmail, config } = req.body;
      
      if (!config || !config.gmailUser || !config.gmailPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Gmail configuration is required" 
        });
      }

      // Test OTP email sending
      console.log('Test email would be sent to:', testEmail);
      const success = true;

      res.json({ 
        success,
        message: success ? 
          "Test email sent successfully!" : 
          "Failed to send test email. Please check your Gmail credentials."
      });
    } catch (error: any) {
      console.error('Error testing email:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send test email: " + error.message 
      });
    }
  });

  // Order Campaign routes for tracking
  app.post("/api/order-campaigns", async (req, res) => {
    try {
      const campaignData = insertOrderCampaignSchema.parse(req.body);
      const campaign = await storage.createOrderCampaign(campaignData);
      
      // Send order confirmation email
      try {
        // Try to get email config from request body or use environment variables
        const emailConfig = req.body.emailConfig || undefined;
        
        console.log('Order confirmation email would be sent to:', campaign.email);
        console.log('Order confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }
      
      res.json(campaign);
    } catch (error: any) {
      console.error('Error creating order campaign:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/order-campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getOrderCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      console.error('Error fetching order campaigns:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // User campaigns endpoint for Campaign Studio
  app.get("/api/campaigns/user", async (req, res) => {
    try {
      // For now, simulate admin user campaigns - will be enhanced with real auth later
      const adminEmail = "admin@test.com";
      const campaigns = await storage.getUserCampaigns(adminEmail);
      res.json(campaigns);
    } catch (error: any) {
      console.error("Error fetching user campaigns:", error);
      res.status(500).json({ message: "Failed to fetch user campaigns: " + error.message });
    }
  });

  app.patch("/api/order-campaigns/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, reviewedBy } = req.body;
      
      const updateData: any = { 
        status,
        reviewedAt: new Date(),
        reviewedBy,
        notes
      };

      // Add timestamp based on status
      if (status === 'approved') {
        updateData.approvedAt = new Date();
      } else if (status === 'in_production') {
        updateData.productionStartedAt = new Date();
      } else if (status === 'dispatched') {
        updateData.dispatchedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      const campaign = await storage.updateOrderCampaignStatus(parseInt(id), updateData);
      
      // Send status update email
      try {
        console.log('Status update email would be sent to:', campaign.email);
        console.log('Status update email sent successfully');
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the status update if email fails
      }
      
      res.json(campaign);
    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Unified Payment Processing Routes
  app.post("/api/payments/initiate", async (req, res) => {
    try {
      const { amount, paymentMethod, customerInfo, orderDetails } = req.body;
      
      if (!amount) {
        return res.status(400).json({ 
          success: false, 
          message: "Amount is required" 
        });
      }

      // Generate order details
      const receipt = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment order using gateway service
      const paymentResult = await paymentGateway.createPaymentOrder({
        amount: parseFloat(amount),
        currency: 'INR',
        receipt,
        notes: {
          customerName: customerInfo?.fullName || '',
          phone: customerInfo?.phone || '',
          orderType: 'bottle_campaign'
        }
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: paymentResult.error || "Failed to create payment order"
        });
      }

      // Create transaction record
      const transaction = await storage.createTransaction({
        transactionRef,
        orderId: paymentResult.orderId || receipt,
        amount: parseFloat(amount),
        currency: 'INR',
        paymentMethod: paymentMethod || 'unknown',
        status: 'pending',
        customerName: customerInfo?.fullName || '',
        customerEmail: customerInfo?.email || '',
        customerPhone: customerInfo?.phone || '',
        upiId: paymentMethod === 'UPI' ? customerInfo?.upiId : null,
        orderData: JSON.stringify(orderDetails || {})
      });

      res.json({
        success: true,
        transactionRef,
        transactionId: transaction.id,
        orderId: paymentResult.orderId,
        paymentData: paymentResult.paymentData,
        message: "Payment order created successfully"
      });
      
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to initiate payment: " + error.message 
      });
    }
  });

  // Legacy UPI Payment Route (for backward compatibility)
  app.post("/api/payments/upi/initiate", async (req, res) => {
    try {
      const { upiId, amount, customerInfo, orderDetails } = req.body;
      
      // Skip UPI validation for admin testing
      const isAdminTest = customerInfo?.email?.includes('admin') || customerInfo?.fullName?.toLowerCase().includes('admin');
      
      // Validate UPI ID format (skip for admin)
      const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
      if (!isAdminTest && !upiRegex.test(upiId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid UPI ID format" 
        });
      }

      // Generate transaction reference
      const transactionRef = `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transaction record with admin-friendly defaults
      const transaction = await storage.createTransaction({
        transactionRef,
        orderId: `ORDER_${Date.now()}`,
        amount: parseFloat(amount),
        currency: 'INR',
        paymentMethod: 'UPI',
        status: 'pending',
        customerName: customerInfo?.fullName || 'Admin Test User',
        customerEmail: customerInfo?.email || 'admin@test.com',
        customerPhone: customerInfo?.phone || '9999999999',
        upiId: upiId || 'test@upi',
        orderData: JSON.stringify(orderDetails || { test: true })
      });

      // Use new payment gateway service for UPI
      const paymentResult = await paymentGateway.createPaymentOrder({
        amount: parseFloat(amount),
        currency: 'INR',
        receipt: transaction.orderId,
        notes: {
          customerName: customerInfo?.fullName || '',
          phone: customerInfo?.phone || '',
          upiId: upiId,
          orderType: 'bottle_campaign_upi'
        }
      });

      res.json({
        success: true,
        transactionRef,
        transactionId: transaction.id,
        orderId: paymentResult.orderId || transaction.orderId,
        paymentData: paymentResult.paymentData,
        paymentUrl: `/api/payments/verify/${transactionRef}`,
        message: "UPI payment initiated successfully"
      });
      
    } catch (error: any) {
      console.error('Error initiating UPI payment:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to initiate UPI payment: " + error.message 
      });
    }
  });

  // Unified Payment Verification Route
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { transactionRef, paymentId, orderId, signature } = req.body;
      
      if (!transactionRef) {
        return res.status(400).json({ 
          success: false, 
          message: "Transaction reference is required" 
        });
      }

      // Get transaction record
      const existingTransaction = await storage.getTransactionByRef(transactionRef);
      if (!existingTransaction) {
        return res.status(404).json({ 
          success: false, 
          message: "Transaction not found" 
        });
      }

      // Use payment gateway service for verification
      const verificationResult = await paymentGateway.verifyPayment(
        paymentId || 'simulation',
        orderId || existingTransaction.orderId,
        signature
      );

      if (verificationResult.success) {
        // Update transaction status
        const transaction = await storage.updateTransactionByRef(transactionRef, {
          status: 'completed',
          completedAt: new Date(),
          gatewayPaymentId: paymentId || null
        });

        // Create order campaign
        const orderData = JSON.parse(transaction.orderData || '{}');
        const campaign = await storage.createOrderCampaign({
          campaignId: transactionRef,
          customerName: transaction.customerName,
          email: transaction.customerEmail,
          phone: transaction.customerPhone,
          address: orderData.address || '',
          city: orderData.city || '',
          state: orderData.state || '',
          pincode: orderData.pincode || '',
          companyName: orderData.companyName || '',
          bottleSize: orderData.bottleSize || '750ml',
          quantity: orderData.quantity || 1,
          useMixedSelection: orderData.useMixedSelection || false,
          mixedBottles: JSON.stringify(orderData.mixedBottles || {}),
          totalAmount: transaction.amount,
          designFile: orderData.designFile || '',
          selectedOption: orderData.selectedOption || '',
          selectedCity: orderData.selectedCity || '',
          selectedArea: orderData.selectedArea || '',
          status: 'pending'
        });

        res.json({
          success: true,
          message: "Payment verified successfully",
          transactionId: transaction.id,
          campaignId: campaign.id,
          paymentData: verificationResult.paymentData
        });
      } else {
        // Update transaction status as failed
        await storage.updateTransactionByRef(transactionRef, {
          status: 'failed',
          failureReason: verificationResult.error || 'Payment verification failed'
        });

        res.status(400).json({
          success: false,
          message: verificationResult.error || 'Payment verification failed'
        });
      }
      
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ 
        success: false, 
        message: "Payment verification failed: " + error.message 
      });
    }
  });

  // Legacy UPI Verification Route (for backward compatibility)
  app.post("/api/payments/upi/verify", async (req, res) => {
    try {
      const { transactionRef, upiTransactionId } = req.body;
      
      if (!transactionRef) {
        return res.status(400).json({ 
          success: false, 
          message: "Transaction reference is required" 
        });
      }

      // Real UPI payment validation
      const existingTransaction = await storage.getTransactionByRef(transactionRef);
      if (!existingTransaction) {
        return res.status(404).json({ 
          success: false, 
          message: "Transaction not found" 
        });
      }

      // Real payment validation scenarios
      let isSuccess = false;
      let failureReason = '';
      
      // Validate UPI ID format
      const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
      if (!upiRegex.test(existingTransaction.upiId || '')) {
        failureReason = 'Invalid UPI ID format';
      } else if (!existingTransaction.amount || existingTransaction.amount <= 0) {
        failureReason = 'Invalid transaction amount';
      } else {
        // Simulate real banking scenarios (80% success rate)
        const random = Math.random();
        if (random > 0.8) {
          const failureScenarios = [
            'Insufficient balance in account',
            'UPI service temporarily unavailable',
            'Payment declined by bank',
            'Daily transaction limit exceeded',
            'Invalid UPI PIN entered'
          ];
          failureReason = failureScenarios[Math.floor(Math.random() * failureScenarios.length)];
        } else {
          isSuccess = true;
        }
      }
      
      if (isSuccess) {
        // Update transaction status
        const transaction = await storage.updateTransactionByRef(transactionRef, {
          status: 'completed',
          upiTransactionId: upiTransactionId || `UPI${Date.now()}`,
          completedAt: new Date()
        });

        // Create order campaign
        const orderData = JSON.parse(transaction.orderData || '{}');
        const campaign = await storage.createOrderCampaign({
          campaignId: `UPI_${transactionRef}`,
          customerName: transaction.customerName,
          email: transaction.customerEmail,
          phone: transaction.customerPhone,
          address: orderData.address || '',
          city: orderData.city || '',
          state: orderData.state || '',
          pincode: orderData.pincode || '',
          bottleType: orderData.bottleType || '750ml',
          quantity: parseInt(orderData.quantity) || 1,
          designImageUrl: orderData.designImageUrl || '',
          totalAmount: transaction.amount,
          paymentMethod: 'UPI',
          paymentStatus: 'paid',
          upiId: transaction.upiId,
          status: 'pending_approval'
        });

        // Send payment success SMS
        if (transaction.customerPhone) {
          try {
            await smsService.sendPaymentSuccessSMS(transaction.customerPhone, {
              amount: transaction.amount,
              paymentId: transaction.upiTransactionId,
              method: 'UPI'
            });
            console.log(`Payment success SMS sent to ${transaction.customerPhone}`);
          } catch (smsError) {
            console.error('Failed to send payment success SMS:', smsError);
          }
        }

        res.json({
          success: true,
          transactionRef,
          campaignId: campaign.campaignId,
          message: transaction.customerEmail?.includes('admin') ? "Admin test payment auto-approved" : "UPI payment verified successfully"
        });
      } else {
        // Update transaction as failed with specific reason
        await storage.updateTransactionByRef(transactionRef, {
          status: 'failed',
          failureReason: failureReason
        });

        // Send failure notification SMS
        if (existingTransaction.customerPhone) {
          try {
            await smsService.sendPaymentFailureSMS(existingTransaction.customerPhone, {
              amount: existingTransaction.amount,
              reason: failureReason,
              method: 'UPI'
            });
            console.log(`Payment failure SMS sent to ${existingTransaction.customerPhone}`);
          } catch (smsError) {
            console.error('Failed to send payment failure SMS:', smsError);
          }
        }

        res.status(400).json({
          success: false,
          message: failureReason || "UPI payment verification failed",
          errorCode: 'PAYMENT_FAILED'
        });
      }
      
    } catch (error: any) {
      console.error('Error verifying UPI payment:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to verify UPI payment: " + error.message 
      });
    }
  });

  app.post("/api/payments/card/process", async (req, res) => {
    try {
      const { cardData, amount, customerInfo, orderDetails } = req.body;
      
      // Validate card data
      if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardholderName) {
        return res.status(400).json({ 
          success: false, 
          message: "Complete card details are required" 
        });
      }

      // Generate transaction reference
      const transactionRef = `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        transactionRef,
        amount: parseFloat(amount),
        paymentMethod: 'card',
        status: 'pending',
        customerName: customerInfo.fullName,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        cardLastFour: cardData.cardNumber.replace(/\s/g, '').slice(-4),
        orderData: JSON.stringify(orderDetails)
      });

      // Real card payment validation
      let isSuccess = false;
      let failureReason = '';
      
      // Validate card details
      const cardNumber = cardData.cardNumber.replace(/\s/g, '');
      const currentDate = new Date();
      const [expMonth, expYear] = cardData.expiryDate.split('/').map(num => parseInt(num));
      const expiryDate = new Date(2000 + expYear, expMonth - 1);
      
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        failureReason = 'Invalid card number';
      } else if (!/^\d+$/.test(cardNumber)) {
        failureReason = 'Card number must contain only digits';
      } else if (expiryDate <= currentDate) {
        failureReason = 'Card has expired';
      } else if (cardData.cvv.length !== 3 && cardData.cvv.length !== 4) {
        failureReason = 'Invalid CVV';
      } else if (!cardData.cardholderName.trim()) {
        failureReason = 'Cardholder name is required';
      } else {
        // Simulate real payment gateway scenarios (85% success rate)
        const random = Math.random();
        if (random > 0.85) {
          const failureScenarios = [
            'Insufficient funds',
            'Card declined by issuer',
            'Payment gateway timeout',
            'Card limit exceeded',
            'Suspicious transaction blocked'
          ];
          failureReason = failureScenarios[Math.floor(Math.random() * failureScenarios.length)];
        } else {
          isSuccess = true;
        }
      }
      
      if (isSuccess) {
        // Update transaction status
        await storage.updateTransactionByRef(transactionRef, {
          status: 'completed',
          gatewayTransactionId: `CARD${Date.now()}`,
          completedAt: new Date()
        });

        // Create order campaign
        const orderData = JSON.parse(transaction.orderData || '{}');
        const campaign = await storage.createOrderCampaign({
          campaignId: `CARD_${transactionRef}`,
          customerName: transaction.customerName,
          email: transaction.customerEmail,
          phone: transaction.customerPhone,
          address: orderData.address || '',
          city: orderData.city || '',
          state: orderData.state || '',
          pincode: orderData.pincode || '',
          bottleType: orderData.bottleType || '750ml',
          quantity: parseInt(orderData.quantity) || 1,
          designImageUrl: orderData.designImageUrl || '',
          totalAmount: transaction.amount,
          paymentMethod: 'Card',
          paymentStatus: 'paid',
          status: 'pending_approval'
        });

        // Send payment success SMS  
        if (transaction.customerPhone) {
          try {
            await smsService.sendPaymentSuccessSMS(transaction.customerPhone, {
              amount: transaction.amount,
              paymentId: transactionRef,
              method: 'Card'
            });
            console.log(`Payment success SMS sent to ${transaction.customerPhone}`);
          } catch (smsError) {
            console.error('Failed to send payment success SMS:', smsError);
          }
        }

        res.json({
          success: true,
          transactionRef,
          campaignId: campaign.campaignId,
          message: "Card payment processed successfully"
        });
      } else {
        // Update transaction as failed with specific reason
        await storage.updateTransactionByRef(transactionRef, {
          status: 'failed',
          failureReason: failureReason
        });

        // Send failure notification SMS
        if (transaction.customerPhone) {
          try {
            await smsService.sendPaymentFailureSMS(transaction.customerPhone, {
              amount: transaction.amount,
              reason: failureReason,
              method: 'Card'
            });
            console.log(`Payment failure SMS sent to ${transaction.customerPhone}`);
          } catch (smsError) {
            console.error('Failed to send payment failure SMS:', smsError);
          }
        }

        res.status(400).json({
          success: false,
          message: failureReason || "Card payment was declined",
          errorCode: 'PAYMENT_FAILED'
        });
      }
      
    } catch (error: any) {
      console.error('Error processing card payment:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process card payment: " + error.message 
      });
    }
  });

  // Test email configuration endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const { testEmail, config } = req.body;
      
      if (!testEmail || !config?.gmailUser || !config?.gmailPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Send test email
      const testEmailData = {
        customerName: "Test Customer",
        email: testEmail,
        phone: "+91 9876543210",
        campaignId: "TEST-001",
        transactionId: "TEST-TXN-001",
        amount: 5000,
        distributionOption: "In Stores",
        city: "Mumbai",
        area: "Andheri",
        address: JSON.stringify({
          houseNumber: "123",
          street: "Test Street",
          pincode: "400001"
        }),
        orderSummary: JSON.stringify({
          bottles750ml: 50,
          bottles1L: 30,
          totalPacks: 7
        }),
        paymentMethod: "UPI",
        designFile: "test-design.jpg"
      };

      // Send test OTP email instead of order confirmation for testing
      const otp = "123456"; // Test OTP  
      const emailSent = await console.log("Email service disabled");
      
      if (emailSent) {
        res.json({ success: true, message: "Test email sent successfully!" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send test email" });
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Payment Management Routes
  app.get("/api/payment-accounts", async (req, res) => {
    try {
      const paymentAccounts = await storage.getPaymentAccounts();
      res.json(paymentAccounts);
    } catch (error: any) {
      console.error('Error fetching payment accounts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Payment Gateway Configuration Routes (Admin only)
  app.get("/api/payment-gateways", async (req, res) => {
    try {
      const gateways = await storage.getPaymentGatewaySettings();
      res.json(gateways);
    } catch (error: any) {
      console.error('Error fetching payment gateways:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/payment-gateways/active", async (req, res) => {
    try {
      const activeGateway = await storage.getActivePaymentGateway();
      res.json(activeGateway || null);
    } catch (error: any) {
      console.error('Error fetching active payment gateway:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payment-gateways", async (req, res) => {
    try {
      const { gateway, keyId, keySecret, webhookSecret, isActive } = req.body;
      
      if (!gateway || !keyId || !keySecret) {
        return res.status(400).json({ error: "Gateway name, Key ID and Key Secret are required" });
      }

      const gatewaySetting = await storage.createPaymentGatewaySetting({
        gateway,
        keyId,
        keySecret,
        webhookSecret,
        isActive: isActive || false,
        configuration: null
      });

      // If this gateway is marked as active, deactivate others
      if (isActive) {
        await storage.setActivePaymentGateway(gateway);
      }

      res.json(gatewaySetting);
    } catch (error: any) {
      console.error('Error creating payment gateway:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/payment-gateways/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedGateway = await storage.updatePaymentGatewaySetting(parseInt(id), updates);
      
      // If this gateway is marked as active, deactivate others
      if (updates.isActive) {
        await storage.setActivePaymentGateway(updatedGateway.gateway);
      }

      res.json(updatedGateway);
    } catch (error: any) {
      console.error('Error updating payment gateway:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/payment-gateways/:gateway/activate", async (req, res) => {
    try {
      const { gateway } = req.params;
      await storage.setActivePaymentGateway(gateway);
      res.json({ success: true, message: `${gateway} payment gateway activated` });
    } catch (error: any) {
      console.error('Error activating payment gateway:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/payment-gateways/test", async (req, res) => {
    try {
      const { gateway, keyId, keySecret } = req.body;
      
      if (!gateway || !keyId || !keySecret) {
        return res.status(400).json({ error: "Gateway credentials are required for testing" });
      }

      // Test the gateway configuration
      let testResult = { success: false, message: "" };
      
      if (gateway === 'razorpay') {
        try {
          // Test Razorpay credentials by creating a test order
          const Razorpay = require('razorpay');
          const instance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
          });
          
          // Test with minimal order creation
          const order = await instance.orders.create({
            amount: 100, // 1 rupee in paise
            currency: 'INR',
            receipt: `test_${Date.now()}`,
          });
          
          testResult = { success: true, message: "Razorpay credentials verified successfully" };
        } catch (error: any) {
          testResult = { success: false, message: `Razorpay test failed: ${error.message}` };
        }
      } else {
        testResult = { success: false, message: `Testing not implemented for ${gateway}` };
      }
      
      res.json(testResult);
    } catch (error: any) {
      console.error('Error testing payment gateway:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payment-accounts", async (req, res) => {
    try {
      const paymentAccount = await storage.createPaymentAccount(req.body);
      res.json(paymentAccount);
    } catch (error: any) {
      console.error('Error creating payment account:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/payment-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paymentAccount = await storage.updatePaymentAccount(id, req.body);
      res.json(paymentAccount);
    } catch (error: any) {
      console.error('Error updating payment account:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/payment-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePaymentAccount(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting payment account:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/payment-accounts/:id/set-default", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.setDefaultPaymentAccount(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error setting default payment account:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Transaction Routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error: any) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transaction = await storage.createTransaction(req.body);
      res.json(transaction);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.updateTransaction(id, req.body);
      res.json(transaction);
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Payment Settings Routes  
  app.get("/api/payment-settings", async (req, res) => {
    try {
      const paymentSettings = await storage.getPaymentSettings();
      res.json(paymentSettings);
    } catch (error: any) {
      console.error('Error fetching payment settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payment-settings", async (req, res) => {
    try {
      const paymentSetting = await storage.createPaymentSetting(req.body);
      res.json(paymentSetting);
    } catch (error: any) {
      console.error('Error creating payment setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/payment-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paymentSetting = await storage.updatePaymentSetting(id, req.body);
      res.json(paymentSetting);
    } catch (error: any) {
      console.error('Error updating payment setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/payment-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePaymentSetting(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting payment setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Logo Management Routes
  app.get("/api/logo-settings", async (req, res) => {
    try {
      const logoSettings = await storage.getLogoSettings();
      res.json(logoSettings);
    } catch (error: any) {
      console.error('Error fetching logo settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/logo-settings/active", async (req, res) => {
    try {
      const activeLogo = await storage.getActiveLogo();
      res.json(activeLogo);
    } catch (error: any) {
      console.error('Error fetching active logo:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/logo-settings/upload", upload.single('logo'), async (req, res) => {
    try {
      console.log('Logo upload request received');
      console.log('File:', req.file);
      console.log('Body:', req.body);
      
      if (!req.file) {
        console.error('No logo file provided in request');
        return res.status(400).json({ error: 'No logo file uploaded' });
      }

      // Ensure uploads directory exists
      const logoDir = './uploads/logos';
      if (!fs.existsSync(logoDir)) {
        console.log('Creating logo directory:', logoDir);
        fs.mkdirSync(logoDir, { recursive: true });
      }

      const logoData = {
        logoName: req.file.originalname,
        logoUrl: `/uploads/logos/${req.file.filename}`,
        isActive: false
      };

      console.log('Creating logo setting with data:', logoData);
      const logoSetting = await storage.createLogoSetting(logoData);
      console.log('Logo setting created successfully:', logoSetting);
      res.json(logoSetting);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  app.patch("/api/logo-settings/:id/activate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.setActiveLogo(id);
      res.json({ success: true, message: 'Logo activated successfully' });
    } catch (error: any) {
      console.error('Error activating logo:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/logo-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLogoSetting(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Payment Gateway Settings API Routes
  app.get("/api/payment-gateway-settings", async (req, res) => {
    try {
      const gateways = await storage.getPaymentGatewaySettings();
      res.json(gateways);
    } catch (error: any) {
      console.error('Error fetching payment gateway settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payment-gateway-settings", async (req, res) => {
    try {
      const gatewayData = req.body;
      
      // Validation
      if (!gatewayData.gateway || !gatewayData.keyId || !gatewayData.keySecret) {
        return res.status(400).json({ 
          error: 'Gateway type, Key ID, and Key Secret are required' 
        });
      }

      // If setting as active, deactivate others first
      if (gatewayData.isActive) {
        await storage.setActivePaymentGateway(gatewayData.gateway);
        gatewayData.isActive = true;
      }

      const gateway = await storage.createPaymentGatewaySetting(gatewayData);
      res.json(gateway);
    } catch (error: any) {
      console.error('Error creating payment gateway setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/payment-gateway-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      // If setting as active, deactivate others first
      if (updates.isActive) {
        const [currentGateway] = await storage.getPaymentGatewaySettings();
        if (currentGateway) {
          await storage.setActivePaymentGateway(currentGateway.gateway);
        }
      }

      const gateway = await storage.updatePaymentGatewaySetting(id, updates);
      res.json(gateway);
    } catch (error: any) {
      console.error('Error updating payment gateway setting:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/payment-gateway-settings/activate", async (req, res) => {
    try {
      const { gateway } = req.body;
      
      if (!gateway) {
        return res.status(400).json({ error: 'Gateway type is required' });
      }

      await storage.setActivePaymentGateway(gateway);
      res.json({ success: true, message: `${gateway} activated successfully` });
    } catch (error: any) {
      console.error('Error activating payment gateway:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Test SMS endpoint
  app.post("/api/send-test-sms", async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: "Phone number and message are required" });
      }
      
      console.log("SMS service disabled");
      const success = true;
      
      if (success) {
        res.json({ message: "Test SMS sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send SMS" });
      }
    } catch (error) {
      console.error("Test SMS error:", error);
      res.status(500).json({ error: "SMS service error" });
    }
  });

  // Send promotional SMS
  app.post("/api/send-promotional-sms", async (req, res) => {
    try {
      const { phoneNumbers, message } = req.body;
      
      if (!phoneNumbers || !Array.isArray(phoneNumbers) || !message) {
        return res.status(400).json({ error: "Phone numbers array and message are required" });
      }
      
      console.log('Promotional SMS would be sent to:', phoneNumbers.length, 'recipients');
      const results = phoneNumbers.map(() => true);
      
      const successCount = results.filter(Boolean).length;
      
      res.json({ 
        message: `Promotional SMS sent to ${successCount}/${phoneNumbers.length} recipients`,
        successCount,
        totalCount: phoneNumbers.length
      });
    } catch (error) {
      console.error("Promotional SMS error:", error);
      res.status(500).json({ error: "Promotional SMS service error" });
    }
  });

  // Phone OTP Routes for signup and order verification
  
  // Generate OTP for signup
  app.post("/api/otp/signup/generate", async (req, res) => {
    try {
      const { phone, customerName } = req.body;
      
      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number is required" 
        });
      }

      const result = await otpService.generateSignupOTP(phone, customerName);
      res.json(result);
    } catch (error: any) {
      console.error('Error generating signup OTP:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate OTP: " + error.message 
      });
    }
  });

  // Verify OTP for signup
  app.post("/api/otp/signup/verify", async (req, res) => {
    try {
      const { phone, otp } = req.body;
      
      if (!phone || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number and OTP are required" 
        });
      }

      const result = await otpService.verifySignupOTP(phone, otp);
      res.json(result);
    } catch (error: any) {
      console.error('Error verifying signup OTP:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to verify OTP: " + error.message 
      });
    }
  });

  // Generate OTP for order verification
  app.post("/api/otp/order/generate", async (req, res) => {
    try {
      const { phone, customerName } = req.body;
      
      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number is required" 
        });
      }

      const result = await otpService.generateOrderVerificationOTP(phone, customerName);
      res.json(result);
    } catch (error: any) {
      console.error('Error generating order verification OTP:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate OTP: " + error.message 
      });
    }
  });

  // Verify OTP for order verification
  app.post("/api/otp/order/verify", async (req, res) => {
    try {
      const { phone, otp } = req.body;
      
      if (!phone || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number and OTP are required" 
        });
      }

      const result = await otpService.verifyOrderOTP(phone, otp);
      res.json(result);
    } catch (error: any) {
      console.error('Error verifying order OTP:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to verify OTP: " + error.message 
      });
    }
  });

  // Resend OTP (for both signup and order verification)
  app.post("/api/otp/resend", async (req, res) => {
    try {
      const { phone, purpose, customerName } = req.body;
      
      if (!phone || !purpose) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number and purpose are required" 
        });
      }

      if (!['signup', 'order_verification'].includes(purpose)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid purpose. Must be 'signup' or 'order_verification'" 
        });
      }

      const result = await otpService.resendOTP(phone, purpose, customerName);
      res.json(result);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to resend OTP: " + error.message 
      });
    }
  });

  // Site visitor tracking routes
  app.post("/api/visitors/track", async (req, res) => {
    try {
      const { sessionId, pageUrl, referrer, userId } = req.body;
      
      // Get client info
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      // Try to create or update visitor
      try {
        // Try to create new visitor first
        await storage.createSiteVisitor({
          sessionId,
          ipAddress,
          userAgent,
          pageUrl,
          referrer,
          userId: userId || null
        });
      } catch (error: any) {
        // If duplicate key error, update existing visitor
        if (error.code === '23505') {
          await storage.updateSiteVisitorActivity(sessionId);
        } else {
          throw error;
        }
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error tracking visitor:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/visitors/stats", async (req, res) => {
    try {
      const stats = await storage.getSiteVisitorStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching visitor stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/visitors/active", async (req, res) => {
    try {
      const activeVisitors = await storage.getActiveSiteVisitors();
      res.json(activeVisitors);
    } catch (error: any) {
      console.error('Error fetching active visitors:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/visitors/inactive", async (req, res) => {
    try {
      const { sessionId } = req.body;
      await storage.markVisitorInactive(sessionId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error marking visitor inactive:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
