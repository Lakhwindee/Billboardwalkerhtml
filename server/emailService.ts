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
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    } else {
      // Generic SMTP configuration for Ionos and other services
      this.transporter = nodemailer.createTransporter({
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

    // Email content
    const subject = '📧 Gmail Test - IamBillBoard System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">✅ Gmail Test Success!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">IamBillBoard Email System</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #10b981; margin: 0 0 20px 0;">🎉 Gmail Integration Working!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Excellent! Your Gmail App Password setup is correct and working perfectly. This confirms your email notifications will work properly.
          </p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #10b981;">📋 Test Message</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6; font-style: italic; color: #065f46;">"${testMessage}"</p>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #3b82f6;">✨ What's Working</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #1e40af;">
              <li>✅ Gmail SMTP connection established</li>
              <li>✅ App Password authentication successful</li>
              <li>✅ Email delivery confirmed</li>
              <li>✅ All campaign notifications ready</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0; font-size: 16px; color: #10b981; font-weight: bold;">
              🚀 Email system fully operational!
            </p>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              Test completed at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This is a test email from IamBillBoard Gmail integration
          </p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Send test email with direct transporter
    const mailOptions = {
      from: `"IamBillBoard Team" <${config.gmailUser}>`,
      to: toEmail,
      subject: subject,
      html: html
    };

    try {
      console.log('📧 Sending Gmail test email...');
      await testTransporter.sendMail(mailOptions);
      console.log(`✅ Gmail test email sent successfully to ${toEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Gmail test email failed:', error);
      if (error.code === 'EAUTH') {
        console.error('❌ Authentication failed - check your Gmail App Password');
      }
      return false;
    }
  }

  // 🆕 OTP Verification Email for Registration
  async sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
    const subject = '🔐 Your OTP for IamBillBoard Account Verification';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🔐 OTP Verification</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">IamBillBoard Account Security</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #4f46e5; margin: 0 0 20px 0;">Verify Your Account</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            ${name ? `Hi ${name},` : 'Hello,'} Here's your One-Time Password (OTP) to verify your IamBillBoard account:
          </p>
          
          <div style="background: #f0f4ff; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
            <div style="font-size: 48px; font-weight: bold; color: #4f46e5; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. IamBillBoard will never ask for your OTP over phone or email.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              Enter this code on the verification page to complete your registration.
            </p>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This is an automated security email from IamBillBoard
          </p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

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
  async sendWelcomeEmail(email: string, firstName: string, username: string): Promise<boolean> {
    const subject = '🎉 Welcome to IamBillBoard - Your Account is Ready!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome ${firstName}!</h1>
        <p>Your account ${username} has been created successfully.</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}

// Export single instance
export const emailService = new EmailService();
export { EmailService };