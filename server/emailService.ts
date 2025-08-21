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

    // Anti-spam optimized email content
    const subject = 'Email Verification Test - IamBillBoard';
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #333333;">
        <div style="padding: 30px 20px; text-align: center; background: #f8f9fa; border-bottom: 3px solid #4f46e5;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #4f46e5;">Email System Verification</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #666;">IamBillBoard Platform</p>
        </div>
        
        <div style="background: #ffffff; color: #333; padding: 30px;">
          <h2 style="color: #4f46e5; margin: 0 0 20px 0; font-size: 20px;">Email Configuration Successful</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #555;">
            Your email system has been successfully configured and tested. All notifications and verifications will now be delivered properly.
          </p>
          
          <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e7ff;">
            <h3 style="margin: 0 0 15px 0; color: #4f46e5; font-size: 16px;">Test Message</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4338ca; background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #c7d2fe;">${testMessage}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 15px 0; color: #475569; font-size: 16px;">System Status</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b;">SMTP Connection:</td><td style="padding: 8px 0; color: #16a34a; font-weight: 600;">Active</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Authentication:</td><td style="padding: 8px 0; color: #16a34a; font-weight: 600;">Verified</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Email Delivery:</td><td style="padding: 8px 0; color: #16a34a; font-weight: 600;">Operational</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Test Time:</td><td style="padding: 8px 0; color: #64748b;">${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-size: 16px; color: #16a34a; font-weight: 600;">
              Email system is now ready for production use
            </p>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            This message was sent from your IamBillBoard account verification system
          </p>
          <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">
            © 2025 IamBillBoard Platform. All rights reserved.
          </p>
        </div>
      </div>
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
    } catch (error) {
      console.error('❌ Gmail test email failed:', error);
      if (error.code === 'EAUTH') {
        console.error('❌ Authentication failed - check your Gmail App Password');
      }
      return false;
    }
  }

  // 🆕 OTP Verification Email for Registration (Anti-spam optimized)
  async sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
    const subject = 'Account Verification Code - IamBillBoard';
    
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #333333;">
        <div style="padding: 30px 20px; text-align: center; background: #f8f9fa; border-bottom: 3px solid #4f46e5;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #4f46e5;">Account Verification</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #666;">IamBillBoard Platform</p>
        </div>
        
        <div style="background: #ffffff; color: #333; padding: 30px;">
          <h2 style="color: #4f46e5; margin: 0 0 20px 0; font-size: 20px;">Account Verification Required</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #555;">
            ${name ? `Hello ${name},` : 'Hello,'} Please use the verification code below to complete your account setup:
          </p>
          
          <div style="background: #f0f4ff; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px solid #e0e7ff;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; font-weight: 600;">Verification Code</p>
            <div style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px; font-family: 'Courier New', monospace; background: #ffffff; padding: 15px; border-radius: 6px; border: 2px solid #c7d2fe;">${otp}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;">Code expires in 10 minutes</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Security Notice:</strong> This code is confidential. Never share it with anyone.
            </p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
              Enter this code on the verification page to activate your account.
            </p>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            This is an automated message from your IamBillBoard account
          </p>
          <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">
            © 2025 IamBillBoard Platform. All rights reserved.
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