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
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
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
          
          <div style="background: #e6f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">📱 What happens next?</h3>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Review Process:</strong> Our team will review your campaign within 24-48 hours</li>
              <li><strong>Design Preview:</strong> After approval, you'll receive a design preview via WhatsApp/Email</li>
              <li><strong>Production:</strong> Once confirmed, we'll start production of your custom bottles</li>
              <li><strong>Distribution:</strong> Your bottles will be distributed to stores in your selected area</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Track your campaign status anytime!</p>
            <a href="${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; 
                      font-weight: bold; margin: 10px;">
              View Campaign Status 📊
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9ff; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Questions? Reply to this email or contact us at <strong>support@iambillboard.com</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  // Campaign approval notification
  async sendCampaignApprovalEmail(userEmail: string, campaignData: any): Promise<boolean> {
    const subject = `✅ Campaign Approved - Production Starting Soon! - ${campaignData.campaignId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 Great News!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your Campaign Has Been Approved</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #10b981; margin: 0 0 20px 0;">Campaign Approved Successfully! ✅</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Congratulations! Your campaign <strong>${campaignData.campaignId}</strong> has been approved by our team. 
            We're excited to bring your custom bottle advertising vision to life!
          </p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #10b981;">🎯 Campaign Status Update</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              Status: <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;">APPROVED</span>
            </p>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">📅 Next Steps & Timeline</h3>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Design Preview:</strong> You'll receive design preview within 1-2 hours via WhatsApp or email</li>
              <li><strong>Production Start:</strong> Production will begin within 24 hours of your design approval</li>
              <li><strong>Quality Check:</strong> Each bottle goes through our quality assurance process</li>
              <li><strong>Distribution:</strong> Bottles will be distributed to stores in your selected area within 3-5 business days</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Track production progress in real-time!</p>
            <a href="${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; 
                      font-weight: bold; margin: 10px;">
              Track Production Status 🏭
            </a>
          </div>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #166534; font-size: 14px;">
            Questions? Reply to this email or contact us at <strong>support@iambillboard.com</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #86efac; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  // Campaign rejection notification  
  async sendCampaignRejectionEmail(userEmail: string, campaignData: any, rejectionReason?: string): Promise<boolean> {
    const subject = `❌ Campaign Update Required - ${campaignData.campaignId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">📝 Action Required</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Campaign Needs Updates</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #ef4444; margin: 0 0 20px 0;">Campaign Updates Needed 📝</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for your campaign submission <strong>${campaignData.campaignId}</strong>. 
            After review, our team has identified some areas that need attention before we can proceed.
          </p>
          
          ${rejectionReason ? `
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #ef4444;">📋 Review Notes</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">${rejectionReason}</p>
          </div>
          ` : ''}
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">🔄 What you can do</h3>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Review:</strong> Check the feedback provided above</li>
              <li><strong>Update:</strong> Make necessary changes to your campaign</li>
              <li><strong>Resubmit:</strong> Submit your updated campaign for review</li>
              <li><strong>Contact us:</strong> Reach out if you need assistance</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Need help with updates?</p>
            <a href="mailto:support@iambillboard.com" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                      color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; 
                      font-weight: bold; margin: 10px;">
              Contact Support 💬
            </a>
          </div>
        </div>
        
        <div style="background: #fef2f2; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
            Questions? Reply to this email or contact us at <strong>support@iambillboard.com</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #fca5a5; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  // Production status update emails
  async sendProductionStatusEmail(userEmail: string, campaignData: any, status: 'production_started' | 'in_progress' | 'shipped' | 'delivered'): Promise<boolean> {
    const statusInfo = {
      production_started: {
        title: '🏭 Production Started!',
        message: 'Great news! Production of your custom bottles has officially started.',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      },
      in_progress: {
        title: '📦 Production In Progress',
        message: 'Your custom bottles are being crafted with care and attention to detail.',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      },
      shipped: {
        title: '🚛 On The Way!',
        message: 'Your bottles have been shipped and are on their way to stores in your area.',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      },
      delivered: {
        title: '✅ Campaign Complete!',
        message: 'Success! Your custom bottles have been delivered to stores and your campaign is now live.',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }
    };

    const info = statusInfo[status];
    const subject = `${info.title} - ${campaignData.campaignId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: ${info.gradient}; color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">${info.title}</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Campaign Status Update</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: ${info.color}; margin: 0 0 20px 0;">${info.message}</h2>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid ${info.color}; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: ${info.color};">📋 Campaign Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Campaign ID:</td><td style="padding: 5px 0;">${campaignData.campaignId}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Status:</td><td style="padding: 5px 0; color: ${info.color}; font-weight: bold;">${status.replace('_', ' ').toUpperCase()}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Quantity:</td><td style="padding: 5px 0;">${campaignData.quantity} bottles</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Location:</td><td style="padding: 5px 0;">${campaignData.selectedCity}, ${campaignData.selectedArea}</td></tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Track your campaign progress!</p>
            <a href="${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard" 
               style="display: inline-block; background: ${info.gradient}; 
                      color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; 
                      font-weight: bold; margin: 10px;">
              View Campaign Details 📊
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9ff; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Questions? Reply to this email or contact us at <strong>support@iambillboard.com</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  // Password reset email
  async sendPasswordResetEmail(userEmail: string, username: string, otp: string): Promise<boolean> {
    const subject = `🔐 Password Reset Request - IamBillBoard`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🔐 Password Reset</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Secure Account Recovery</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #3b82f6; margin: 0 0 20px 0;">Reset Your Password 🔑</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi <strong>${username}</strong>, we received a request to reset your password for your IamBillBoard account.
          </p>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #3b82f6;">🔢 Your Reset Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #1d4ed8; letter-spacing: 5px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
              ⏰ This code expires in 10 minutes
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #d97706;">🛡️ Security Notice</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #92400e;">
              <li>Never share this code with anyone</li>
              <li>We will never ask for this code via phone or email</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password remains unchanged until you complete the reset</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Need help?</p>
            <a href="mailto:support@iambillboard.com" 
               style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                      color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; 
                      font-weight: bold; margin: 10px;">
              Contact Support 💬
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9ff; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Questions? Reply to this email or contact us at <strong>support@iambillboard.com</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  // Test email functionality
  async sendTestEmail(toEmail: string, testMessage: string = "This is a test email"): Promise<boolean> {
    const subject = '📧 Email Test - IamBillBoard System';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">📧 Email Test</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">IamBillBoard Email System</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #4f46e5; margin: 0 0 20px 0;">Email System Test Successful! ✅</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Congratulations! Your Gmail integration is working perfectly. This test email confirms that your email service is properly configured and ready to send notifications.
          </p>
          
          <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #4f46e5;">📋 Test Message</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6; font-style: italic;">"${testMessage}"</p>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #10b981;">✨ What This Means</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #065f46;">
              <li>Gmail SMTP connection is working</li>
              <li>Email credentials are valid</li>
              <li>All email notifications will work properly</li>
              <li>Campaign emails, password resets, and welcome emails are ready</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0; font-size: 16px; color: #10b981; font-weight: bold;">
              🎉 Email service is fully operational!
            </p>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              Test sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This is an automated test email from IamBillBoard
          </p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: toEmail, subject, html });
  }

  // Welcome email for new users
  async sendWelcomeEmail(email: string, firstName: string, username: string): Promise<boolean> {
    const subject = '🎉 Welcome to IamBillBoard - Your Account is Ready!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🍼 IamBillBoard</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Custom Bottle Advertising Platform</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #667eea; margin: 0 0 20px 0;">Welcome to IamBillBoard! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${firstName}, welcome to IamBillBoard! Your account has been successfully created and verified.
          </p>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #667eea;">🎯 Account Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Username:</td><td style="padding: 5px 0;">${username}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;">${email}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Status:</td><td style="padding: 5px 0;">✅ Verified & Active</td></tr>
            </table>
          </div>
          
          <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #f56565; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #f56565;">🚀 What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li>Complete your profile setup</li>
              <li>Browse our design gallery for inspiration</li>
              <li>Create your first bottle advertising campaign</li>
              <li>Upload your custom designs or choose from our templates</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://iambillboard.com/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Access Your Dashboard →
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
            Need help? Contact our support team at support@iambillboard.com or visit our help center.
          </p>
        </div>
        
        <div style="background: #f1f5f9; color: #64748b; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">Thank you for choosing IamBillBoard for your custom bottle advertising needs!</p>
          <p style="margin: 5px 0 0 0;">© 2025 IamBillBoard. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Design reupload notification email
  async sendDesignReuploadEmail(userEmail: string, campaignData: any): Promise<boolean> {
    const subject = `🎨 Design Update Required - ${campaignData.campaignId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f97316 0%, #d97706 100%); color: white;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎨 Design Update Needed</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your Campaign Design Requires Attention</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #f97316; margin: 0 0 20px 0;">Please Re-upload Your Design 🎨</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${campaignData.customerName}, your recent design submission for campaign <strong>${campaignData.campaignId}</strong> needs to be updated.
          </p>
          
          ${campaignData.designFeedback ? `
          <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #f97316;">📝 Feedback from Our Team</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">${campaignData.designFeedback}</p>
          </div>
          ` : ''}
          
          ${campaignData.designRejectionReason ? `
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #ef4444;">⚠️ Additional Notes</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">${campaignData.designRejectionReason}</p>
          </div>
          ` : ''}
          
          <div style="background: #fffafb; padding: 20px; border-radius: 8px; border-left: 4px solid #f43f5e; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #f43f5e;">🚀 Action Required</h3>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Please upload a revised design that addresses the feedback above:</p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #7f1d1d;">
              <li>Ensure all logos and text are high-resolution (300 DPI minimum)</li>
              <li>Check color contrast for readability</li>
              <li>Confirm design elements fit within the bottle label dimensions</li>
              <li>Review spelling and grammar in all text elements</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Upload your updated design here:</p>
            <a href="${campaignData.actionUrl || process.env.FRONTEND_URL + '/dashboard?tab=campaigns'}" 
               style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #d97706 100%); 
                      color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; 
                      font-weight: bold; margin: 10px;">
              Upload New Design ⬆️
            </a>
          </div>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">📋 Campaign Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Campaign ID:</td><td style="padding: 5px 0;">${campaignData.campaignId}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Bottle Type:</td><td style="padding: 5px 0;">${campaignData.bottleType}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Quantity:</td><td style="padding: 5px 0;">${campaignData.quantity} bottles</td></tr>
            </table>
          </div>
        </div>
        
        <div style="background: #fef7f7; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
            Questions? Reply to this email or contact us at <strong>support@iambillboard.com</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #fca5a5; font-size: 12px;">
            © 2025 IamBillBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }
}

export const emailService = new EmailService();