import nodemailer from 'nodemailer';
import { storage } from './storage';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email credentials are provided - supports Gmail, Ionos, and other SMTP services
    const emailUser = process.env.GMAIL_USER || process.env.IONOS_EMAIL_USER || process.env.EMAIL_USER;
    const emailPass = process.env.GMAIL_APP_PASSWORD || process.env.IONOS_EMAIL_PASSWORD || process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');
    const emailService = process.env.EMAIL_SERVICE || 'gmail';

    if (!emailUser || !emailPass) {
      console.warn('📧 Email credentials not provided. Email service will be disabled.');
      console.warn('📧 For production, set EMAIL_USER and EMAIL_PASSWORD environment variables');
      this.transporter = null;
      return;
    }

    // Create transporter with flexible configuration
    if (emailService === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
          user: emailUser,
          pass: emailPass // App Password required
        },
        tls: {
          rejectUnauthorized: false
        },
        pool: true,
        maxConnections: 1,
        maxMessages: 3
      });
    } else {
      // Generic SMTP configuration for Ionos and other services
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }

    console.log(`📧 Email transporter initialized for ${emailService} service`);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"IamBillBoard Team" <${process.env.GMAIL_USER || 'noreply@iambillboard.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // 🆕 CLEAN Gmail Test Email Method 
  async sendTestEmail(toEmail: string, testMessage: string = "Testing Gmail integration", config?: { gmailUser: string; gmailPassword: string }): Promise<boolean> {
    
    // Gmail App Password required
    if (!config || !config.gmailUser || !config.gmailPassword) {
      console.error('❌ Gmail App Password required for email testing');
      console.error('❌ Set up Gmail 2-Step Verification and generate App Password');
      return false;
    }
    
    // Clean Gmail SMTP Configuration
    let testTransporter;
    try {
      testTransporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
          user: config.gmailUser,
          pass: config.gmailPassword // This MUST be App Password
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      console.log('📧 Clean Gmail SMTP setup created');
      console.log('📧 Testing with email:', config.gmailUser.substring(0, 5) + '***');
      console.log(`📧 App Password length: ${config.gmailPassword.length} characters`);
      
    } catch (error) {
      console.error('❌ Failed to create Gmail transporter:', error);
      return false;
    }

    // Extract OTP from test message if present
    const otpMatch = testMessage.match(/verification code:\s*(\d{6})/i);
    const otp = otpMatch ? otpMatch[1] : null;
    
    // Professional OTP email template
    const subject = '🎯 IamBillBoard - Account Verification Code';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification - IamBillBoard</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden;">
          
          <!-- Header with Gradient -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); opacity: 0.3;"></div>
            <div style="position: relative; z-index: 2;">
              <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; padding: 25px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.2);">
                <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: -1px;">
                  🎯 IamBillBoard
                </h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; color: #e0e7ff; font-weight: 500; letter-spacing: 0.5px;">
                  Premium Bottle Advertising Solutions
                </p>
              </div>
              <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);">
                <h2 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 600;">
                  🔐 Email Verification Required
                </h2>
              </div>
            </div>
          </div>
          
          <!-- Welcome Section -->
          <div style="padding: 50px 40px 30px 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h3 style="margin: 0 0 15px 0; font-size: 28px; color: #1e293b; font-weight: 700; letter-spacing: -0.5px;">
                Welcome! 👋
              </h3>
              <p style="margin: 0; font-size: 17px; line-height: 1.6; color: #475569; max-width: 450px; margin: 0 auto;">
                Thank you for joining IamBillBoard! You're just one step away from accessing our premium bottle advertising platform.
              </p>
            </div>
            
            ${otp ? `
            <!-- OTP Code Section -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 3px solid transparent; background-clip: padding-box; border-radius: 20px; padding: 40px; text-align: center; margin: 40px 0; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%); z-index: 1;"></div>
              
              <div style="position: relative; z-index: 2;">
                <div style="margin-bottom: 20px;">
                  <span style="font-size: 48px;">🔑</span>
                </div>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                  Your Verification Code
                </p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 42px; font-weight: bold; padding: 25px 40px; border-radius: 16px; letter-spacing: 8px; font-family: 'Courier New', Monaco, monospace; display: inline-block; box-shadow: 0 10px 40px rgba(102,126,234,0.4); text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  ${otp}
                </div>
                <div style="margin-top: 20px; padding: 15px; background: rgba(239,68,68,0.1); border-radius: 10px; border: 1px solid rgba(239,68,68,0.2);">
                  <p style="margin: 0; font-size: 13px; color: #dc2626; font-weight: 600;">
                    ⏰ This code will expire in 15 minutes
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Step-by-Step Instructions -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 5px solid #0284c7; border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h4 style="margin: 0 0 20px 0; font-size: 18px; color: #0369a1; font-weight: 700;">
                📋 How to Complete Verification
              </h4>
              <div>
                <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                  <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">1</span>
                  <span style="color: #0369a1; font-weight: 500;">Return to the IamBillBoard verification page</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                  <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">2</span>
                  <span style="color: #0369a1; font-weight: 500;">Enter the 6-digit verification code above</span>
                </div>
                <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                  <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">3</span>
                  <span style="color: #0369a1; font-weight: 500;">Click "Verify Email" to activate your account</span>
                </div>
              </div>
            </div>
            ` : `
            <!-- System Test Message -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 5px solid #16a34a; border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h4 style="margin: 0 0 15px 0; font-size: 18px; color: #15803d; font-weight: 700;">
                ✅ Email System Test
              </h4>
              <p style="margin: 0; font-size: 16px; color: #166534; background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px;">
                ${testMessage}
              </p>
            </div>
            `}
            
            <!-- Security Warning -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fce7e7 100%); border: 2px solid #fca5a5; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <div style="display: flex; align-items: flex-start; gap: 15px;">
                <span style="font-size: 24px;">🛡️</span>
                <div>
                  <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #dc2626; font-weight: 700;">
                    Important Security Notice
                  </h4>
                  <ul style="margin: 0; padding-left: 20px; color: #991b1b; line-height: 1.6; font-size: 14px;">
                    <li>Never share this verification code with anyone</li>
                    <li>IamBillBoard staff will never ask for your verification code</li>
                    <li>If you didn't request this verification, please ignore this email</li>
                    <li>This code can only be used once and expires automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Premium Footer -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px; text-align: center; color: #ffffff;">
            <div style="margin-bottom: 25px;">
              <h4 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                IamBillBoard Team
              </h4>
              <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                Revolutionizing brand advertising through innovative bottle solutions<br>
                <strong style="color: #667eea; font-size: 16px;">Chandigarh • Panchkula • Mohali</strong>
              </p>
            </div>
            
            <div style="border-top: 1px solid #374151; padding-top: 25px; margin-top: 25px;">
              <div style="margin-bottom: 15px;">
                <span style="background: rgba(102,126,234,0.2); color: #93c5fd; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
                  PREMIUM ADVERTISING PLATFORM
                </span>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                © 2025 IamBillBoard Platform. All rights reserved.<br>
                This is an automated security message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send test email with anti-spam headers
    const mailOptions = {
      from: `"IamBillBoard Team" <${config.gmailUser}>`,
      to: toEmail,
      subject: subject,
      html: html,
      headers: {
        'X-Mailer': 'IamBillBoard Platform',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'List-Unsubscribe': '<mailto:unsubscribe@iambillboard.com>',
        'Reply-To': config.gmailUser,
        'Return-Path': config.gmailUser,
        'MIME-Version': '1.0',
        'Content-Type': 'text/html; charset=UTF-8'
      },
      messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@iambillboard.com>`,
      date: new Date(),
      encoding: 'utf8'
    };

    try {
      console.log('📧 Sending anti-spam optimized email...');
      await testTransporter.sendMail(mailOptions);
      console.log(`✅ Gmail test email sent successfully to ${toEmail}`);
      return true;
    } catch (error: any) {
      console.error('❌ Gmail test email failed:', error);
      if (error.code === 'EAUTH') {
        console.error('❌ Authentication failed - check your Gmail App Password');
      }
      return false;
    }
  }

  // 🆕 Professional OTP Verification Email (Premium Design)
  async sendOTPEmail(email: string, otp: string, name?: string, config?: any): Promise<boolean> {
    const subject = '🎯 IamBillBoard - Account Verification Code';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification - IamBillBoard</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden;">
          
          <!-- Header with Gradient -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); opacity: 0.3;"></div>
            <div style="position: relative; z-index: 2;">
              <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; padding: 25px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.2);">
                <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: -1px;">
                  🎯 IamBillBoard
                </h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; color: #e0e7ff; font-weight: 500; letter-spacing: 0.5px;">
                  Premium Bottle Advertising Solutions
                </p>
              </div>
              <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);">
                <h2 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px;">
                  🔐 Email Verification Required
                </h2>
              </div>
            </div>
          </div>
          
          <!-- Welcome Section -->
          <div style="padding: 50px 40px 30px 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h3 style="margin: 0 0 15px 0; font-size: 28px; color: #1e293b; font-weight: 700; letter-spacing: -0.5px;">
                Welcome${name ? ` ${name}` : ''}! 👋
              </h3>
              <p style="margin: 0; font-size: 17px; line-height: 1.6; color: #475569; max-width: 450px; margin: 0 auto;">
                Thank you for joining IamBillBoard! You're just one step away from accessing our premium bottle advertising platform.
              </p>
            </div>
            
            <!-- OTP Code Section with Animation Effect -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 3px solid transparent; background-clip: padding-box; border-radius: 20px; padding: 40px; text-align: center; margin: 40px 0; position: relative; overflow: hidden;">
              <!-- Animated background -->
              <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%); z-index: 1; animation: pulse 3s ease-in-out infinite;"></div>
              
              <div style="position: relative; z-index: 2;">
                <div style="margin-bottom: 20px;">
                  <span style="font-size: 48px; animation: bounce 2s ease-in-out infinite;">🔑</span>
                </div>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                  Your Verification Code
                </p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 42px; font-weight: bold; padding: 25px 40px; border-radius: 16px; letter-spacing: 8px; font-family: 'Courier New', Monaco, monospace; display: inline-block; box-shadow: 0 10px 40px rgba(102,126,234,0.4); text-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: scale(1); transition: transform 0.3s ease;">
                  ${otp}
                </div>
                <div style="margin-top: 20px; padding: 15px; background: rgba(239,68,68,0.1); border-radius: 10px; border: 1px solid rgba(239,68,68,0.2);">
                  <p style="margin: 0; font-size: 13px; color: #dc2626; font-weight: 600;">
                    ⏰ This code will expire in 15 minutes
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Step-by-Step Instructions -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 5px solid #0284c7; border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h4 style="margin: 0 0 20px 0; font-size: 18px; color: #0369a1; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                📋 How to Complete Verification
              </h4>
              <div style="space-y: 15px;">
                <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                  <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">1</span>
                  <span style="color: #0369a1; font-weight: 500;">Return to the IamBillBoard verification page</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                  <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">2</span>
                  <span style="color: #0369a1; font-weight: 500;">Enter the 6-digit verification code above</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 0; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                  <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">3</span>
                  <span style="color: #0369a1; font-weight: 500;">Click "Verify Email" to activate your account</span>
                </div>
              </div>
            </div>
            
            <!-- Security Warning -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fce7e7 100%); border: 2px solid #fca5a5; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <div style="display: flex; align-items: flex-start; gap: 15px;">
                <span style="font-size: 24px;">🛡️</span>
                <div>
                  <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #dc2626; font-weight: 700;">
                    Important Security Notice
                  </h4>
                  <ul style="margin: 0; padding-left: 20px; color: #991b1b; line-height: 1.6; font-size: 14px;">
                    <li>Never share this verification code with anyone</li>
                    <li>IamBillBoard staff will never ask for your verification code</li>
                    <li>If you didn't request this verification, please ignore this email</li>
                    <li>This code can only be used once and expires automatically</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Call to Action Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 8px 32px rgba(102,126,234,0.4); transition: all 0.3s ease; text-shadow: 0 1px 2px rgba(0,0,0,0.2); letter-spacing: 0.5px;">
                🚀 Complete Your Verification
              </a>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #94a3b8;">
                Click the button to go back to verification page
              </p>
            </div>
            
            <!-- What's Next Section -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 35px; margin: 40px 0; border: 1px solid #e2e8f0;">
              <h4 style="margin: 0 0 25px 0; font-size: 20px; color: #1e293b; font-weight: 700; text-align: center;">
                🎯 What Awaits You After Verification
              </h4>
              <div style="display: grid; gap: 20px;">
                <div style="display: flex; align-items: center; padding: 15px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <span style="font-size: 28px; margin-right: 20px;">🍾</span>
                  <div>
                    <strong style="color: #1e293b; font-size: 16px; display: block; margin-bottom: 4px;">Custom Bottle Design Studio</strong>
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.4;">Create stunning, professional bottle labels with our advanced design tools</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; padding: 15px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <span style="font-size: 28px; margin-right: 20px;">💰</span>
                  <div>
                    <strong style="color: #1e293b; font-size: 16px; display: block; margin-bottom: 4px;">Real-time Smart Pricing</strong>
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.4;">Get instant, accurate quotes based on quantity, location, and specifications</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; padding: 15px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <span style="font-size: 28px; margin-right: 20px;">📊</span>
                  <div>
                    <strong style="color: #1e293b; font-size: 16px; display: block; margin-bottom: 4px;">Professional Campaign Dashboard</strong>
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.4;">Track orders, monitor progress, and manage your advertising campaigns</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; padding: 15px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <span style="font-size: 28px; margin-right: 20px;">🎯</span>
                  <div>
                    <strong style="color: #1e293b; font-size: 16px; display: block; margin-bottom: 4px;">Targeted Distribution Network</strong>
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.4;">Reach your audience across Chandigarh, Panchkula, and Mohali regions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Premium Footer -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px; text-align: center; color: #ffffff;">
            <div style="margin-bottom: 25px;">
              <h4 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                IamBillBoard Team
              </h4>
              <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                Revolutionizing brand advertising through innovative bottle solutions<br>
                <strong style="color: #667eea; font-size: 16px;">Chandigarh • Panchkula • Mohali</strong>
              </p>
            </div>
            
            <div style="border-top: 1px solid #374151; padding-top: 25px; margin-top: 25px;">
              <div style="margin-bottom: 15px;">
                <span style="background: rgba(102,126,234,0.2); color: #93c5fd; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
                  PREMIUM ADVERTISING PLATFORM
                </span>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                © 2025 IamBillBoard Platform. All rights reserved.<br>
                This is an automated security message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // If no transporter but we have config, use the test email method
    if (!this.transporter && config) {
      console.log('📧 Using provided Gmail config for OTP email');
      return this.sendTestEmail(email, `Your verification code: ${otp}`, config);
    }

    return this.sendEmail({ to: email, subject, html });
  }

  // Campaign submission confirmation email
  async sendCampaignSubmissionEmail(userEmail: string, campaignData: any): Promise<boolean> {
    const subject = `🎉 Campaign Submitted Successfully - ${campaignData.campaignId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🍼 IamBillBoard</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Custom Bottle Advertising Platform</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #667eea; margin: 0 0 20px 0;">Campaign Submitted Successfully! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for choosing IamBillBoard! Your custom bottle advertising campaign has been submitted successfully and is now under review by our team.
          </p>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #667eea;">📋 Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Campaign ID:</td><td style="padding: 5px 0;">${campaignData.campaignId}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Customer Name:</td><td style="padding: 5px 0;">${campaignData.customerName || 'Not provided'}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Bottle Type:</td><td style="padding: 5px 0;">${campaignData.bottleType}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Quantity:</td><td style="padding: 5px 0;">${campaignData.quantity} bottles</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Total Amount:</td><td style="padding: 5px 0; color: #667eea; font-weight: bold;">₹${campaignData.totalAmount?.toLocaleString()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Payment Status:</td><td style="padding: 5px 0; color: #10b981;">${campaignData.paymentStatus}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Distribution:</td><td style="padding: 5px 0;">${campaignData.selectedOption}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Location:</td><td style="padding: 5px 0;">${campaignData.selectedCity}, ${campaignData.selectedArea}</td></tr>
            </table>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  // Welcome email for new users
  async sendWelcomeEmail(email: string, firstName: string, username: string, password: string): Promise<boolean> {
    const subject = '🎉 Welcome to IamBillBoard - Your Account is Ready!';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to IamBillBoard</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 40px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);"></div>
            <div style="position: relative; z-index: 2;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">🎉 Welcome to IamBillBoard!</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">India's #1 Custom Bottle Advertising Platform</p>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 50px 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Hi ${firstName}!</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0;">Your account has been successfully created! Here are your login credentials:</p>
            </div>
            
            <!-- Credentials Box -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%);"></div>
              <div style="position: relative; z-index: 2;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 20px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Login Credentials</p>
                
                <div style="background: #ffffff; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; margin: 0 auto 20px; display: inline-block; box-shadow: 0 4px 12px rgba(239,68,68,0.15); text-align: left; max-width: 280px;">
                  <div style="margin-bottom: 16px;">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Username/Email</p>
                    <p style="font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; color: #1e293b; margin: 0; word-break: break-all;">${username}</p>
                  </div>
                  <div>
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Password</p>
                    <p style="font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; color: #ef4444; margin: 0; letter-spacing: 2px;">${password}</p>
                  </div>
                </div>
                
                <p style="color: #64748b; font-size: 12px; margin: 0; font-style: italic;">Please keep these credentials safe and consider changing your password after first login</p>
              </div>
            </div>
            
            <!-- Login Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/signin" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(239,68,68,0.3); transition: all 0.2s ease;">
                Sign In to Your Account
              </a>
            </div>
            
            <!-- Features -->
            <div style="background: rgba(239,68,68,0.05); border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">What You Can Do:</h3>
              <ul style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Design custom bottle labels with our easy-to-use tools</li>
                <li style="margin-bottom: 8px;">Get instant price quotes for your campaigns</li>
                <li style="margin-bottom: 8px;">Track your orders and campaign performance</li>
                <li style="margin-bottom: 8px;">Access professional design templates</li>
                <li>Connect with pan-India distribution network</li>
              </ul>
            </div>
            
            <!-- Support */}
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">Need help getting started?</p>
              <p style="color: #ef4444; font-size: 14px; margin: 0;">📞 Contact Support: support@iambillboard.com</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">© 2025 IamBillBoard. All rights reserved.</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">India's Premier Custom Bottle Advertising Platform</p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Order Confirmation Email
  async sendOrderConfirmationEmail(email: string, userName: string, orderDetails: any): Promise<boolean> {
    const subject = '✅ Order Confirmed - IamBillBoard Campaign Started!';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">✅ Order Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Your campaign has been successfully placed</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 50px 40px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Hi ${userName}!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0 0 30px;">Great news! Your bottle advertising campaign order has been confirmed and is now being processed by our team.</p>
            
            <!-- Order Details -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin: 0 0 15px;">Order Details:</h3>
              <p style="color: #64748b; margin: 5px 0;"><strong>Campaign Name:</strong> ${orderDetails.campaignName || 'Custom Campaign'}</p>
              <p style="color: #64748b; margin: 5px 0;"><strong>Quantity:</strong> ${orderDetails.quantity || 'N/A'} bottles</p>
              <p style="color: #64748b; margin: 5px 0;"><strong>Estimated Cost:</strong> ₹${orderDetails.estimatedCost || 'TBD'}</p>
              <p style="color: #64748b; margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <!-- Next Steps -->
            <div style="background: rgba(16,185,129,0.05); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">What Happens Next:</h3>
              <ol style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Our design team will review your campaign requirements</li>
                <li style="margin-bottom: 8px;">You'll receive email updates on approval status</li>
                <li style="margin-bottom: 8px;">Once approved, production will begin immediately</li>
                <li>Track your campaign progress in your dashboard</li>
              </ol>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                View Dashboard
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 IamBillBoard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Campaign Approval Email
  async sendCampaignApprovalEmail(email: string, userName: string, campaignName: string): Promise<boolean> {
    const subject = '🎉 Campaign Approved - Production Starting!';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Approved</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">🎉 Campaign Approved!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Your design has been approved and production is starting</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 50px 40px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Congratulations ${userName}!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0 0 30px;">Your campaign "<strong>${campaignName}</strong>" has been reviewed and approved by our team. We're now moving forward with production!</p>
            
            <!-- Status Update -->
            <div style="background: rgba(59,130,246,0.05); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">Production Timeline:</h3>
              <ul style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Design finalization: 1-2 business days</li>
                <li style="margin-bottom: 8px;">Bottle printing & production: 3-5 business days</li>
                <li style="margin-bottom: 8px;">Quality check & packaging: 1-2 business days</li>
                <li>Shipping & delivery: 2-3 business days</li>
              </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Track Progress
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 IamBillBoard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Campaign Rejection Email
  async sendCampaignRejectionEmail(email: string, userName: string, campaignName: string, rejectionReason: string): Promise<boolean> {
    const subject = '❌ Campaign Update Required - Please Review';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Review Required</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">⚠️ Review Required</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Your campaign needs some updates before approval</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 50px 40px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Hi ${userName},</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0 0 30px;">We've reviewed your campaign "<strong>${campaignName}</strong>" and need some updates before we can proceed with production.</p>
            
            <!-- Feedback -->
            <div style="background: rgba(245,158,11,0.05); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">Feedback from our team:</h3>
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0;">${rejectionReason}</p>
            </div>
            
            <!-- Next Steps -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin: 0 0 15px;">What to do next:</h3>
              <ol style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Review the feedback above</li>
                <li style="margin-bottom: 8px;">Update your design or campaign details</li>
                <li style="margin-bottom: 8px;">Resubmit for review</li>
                <li>Our team will review again within 24 hours</li>
              </ol>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Update Campaign
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 IamBillBoard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Design Reupload Email
  async sendDesignReuploadEmail(email: string, userName: string, campaignName: string): Promise<boolean> {
    const subject = '🔄 Design Updated - Review in Progress';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Design Updated</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">🔄 Design Updated!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Your updated design is now under review</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 50px 40px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Hi ${userName}!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0 0 30px;">Thank you for updating your campaign "<strong>${campaignName}</strong>". Our design team is now reviewing your new submission.</p>
            
            <!-- Status -->
            <div style="background: rgba(139,92,246,0.05); border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">Review Process:</h3>
              <ul style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">✅ Design received and queued for review</li>
                <li style="margin-bottom: 8px;">🔄 Quality check in progress (24-48 hours)</li>
                <li style="margin-bottom: 8px;">📧 You'll receive approval/feedback via email</li>
                <li>🚀 Upon approval, production begins immediately</li>
              </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                View Campaign
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 IamBillBoard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Password Change Confirmation Email
  async sendPasswordChangeConfirmationEmail(email: string, userName: string): Promise<boolean> {
    const subject = '🔐 Password Changed Successfully - IamBillBoard';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">🔐 Password Updated!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Your account password has been successfully changed</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 50px 40px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Hi ${userName}!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0 0 30px;">Your password has been successfully updated. Your account is now more secure with the new password.</p>
            
            <!-- Security Info -->
            <div style="background: rgba(16,185,129,0.05); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">Security Details:</h3>
              <ul style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Change Time:</strong> ${new Date().toLocaleString('en-IN')}</li>
                <li style="margin-bottom: 8px;"><strong>Account:</strong> ${email}</li>
                <li style="margin-bottom: 8px;"><strong>Status:</strong> Password updated successfully</li>
                <li><strong>Action Required:</strong> None - You're all set!</li>
              </ul>
            </div>
            
            <!-- Important Notice -->
            <div style="background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); border-radius: 12px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">⚠️ If you didn't change your password:</h3>
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0;">If you did not make this change, please contact our support team immediately at <strong>support@iambillboard.com</strong> or call us.</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/signin" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Sign In Now
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 IamBillBoard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  async sendPasswordResetOtpEmail(toEmail: string, resetOtp: string, username: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const subject = '🔐 IamBillBoard - Password Reset OTP';
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - IamBillBoard</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden;">
            
            <!-- Header with Gradient -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 50px 40px; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); opacity: 0.3;"></div>
              <div style="position: relative; z-index: 2;">
                <div style="background: rgba(255,255,255,0.15); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                  <span style="font-size: 36px;">🔐</span>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Password Reset</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 18px; font-weight: 400;">Secure password reset for your account</p>
              </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 50px 40px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Hi ${username}!</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0;">We received a request to reset your password. Use the OTP below to reset your password:</p>
              </div>
              
              <!-- OTP Code Box -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%);"></div>
                <div style="position: relative; z-index: 2;">
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Reset OTP</p>
                  <div style="background: #ffffff; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block; box-shadow: 0 4px 12px rgba(239,68,68,0.15);">
                    <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #ef4444; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${resetOtp}</span>
                  </div>
                  <p style="color: #64748b; font-size: 12px; margin: 16px 0 0; font-style: italic;">This OTP expires in 10 minutes</p>
                </div>
              </div>
              
              <!-- Instructions -->
              <div style="background: rgba(239,68,68,0.05); border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">Reset Instructions:</h3>
                <ol style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Enter the 6-digit OTP above on the password reset page</li>
                  <li style="margin-bottom: 8px;">Create a new secure password (minimum 6 characters)</li>
                  <li style="margin-bottom: 8px;">Confirm your new password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>
              
              <!-- Security Notice -->
              <div style="background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); border-radius: 12px; padding: 20px; margin: 30px 0;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 20px; margin-right: 12px; margin-top: 2px;">⚠️</span>
                  <div>
                    <h4 style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Security Notice</h4>
                    <p style="color: #d97706; font-size: 13px; line-height: 18px; margin: 0;">If you didn't request this password reset, please ignore this email. Your account remains secure. The code will expire automatically in 10 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; line-height: 18px; margin: 0 0 12px;">
                <strong>IamBillBoard</strong> - Custom Bottle Advertising Platform<br>
                Professional branding solutions for businesses across India
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                This is an automated email. Please do not reply to this message.<br>
                If you need assistance, contact our support team.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"IamBillBoard Team" <${process.env.GMAIL_USER || 'noreply@iambillboard.com'}>`,
        to: toEmail,
        subject: subject,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent successfully to ${toEmail}`);
      return true;
    } catch (error: any) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }
}

// Export single instance
export const emailService = new EmailService();
export { EmailService };