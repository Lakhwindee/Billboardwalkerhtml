import twilio from 'twilio';
import { storage } from './storage';

interface SMSOptions {
  to: string;
  message: string;
}

class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;

  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
    this.initializeClient();
  }

  private initializeClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
      console.log('Twilio SMS client initialized successfully');
    } else {
      console.warn('Twilio credentials not provided. SMS service will be disabled.');
    }
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    if (!this.client) {
      console.error('SMS client not initialized. Please provide Twilio credentials.');
      return false;
    }

    try {
      // Format Indian phone numbers
      const phoneNumber = this.formatIndianPhoneNumber(options.to);
      
      const message = await this.client.messages.create({
        body: options.message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log(`SMS sent successfully to ${phoneNumber}. SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  private formatIndianPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // If it's a 10-digit Indian number, add country code
    if (cleanPhone.length === 10 && cleanPhone.match(/^[6-9]/)) {
      return `+91${cleanPhone}`;
    }
    
    // If it already has country code
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      return `+${cleanPhone}`;
    }
    
    // If it starts with +91
    if (phone.startsWith('+91')) {
      return phone;
    }
    
    // Default fallback
    return `+91${cleanPhone.slice(-10)}`;
  }

  // Campaign submission SMS
  async sendCampaignSubmissionSMS(userPhone: string, campaignData: any): Promise<boolean> {
    const message = `🎉 IamBillBoard Campaign Submitted!

Campaign ID: ${campaignData.campaignId}
Bottle Type: ${campaignData.bottleType}
Quantity: ${campaignData.quantity} bottles
Amount: ₹${campaignData.totalAmount?.toLocaleString()}
Location: ${campaignData.selectedCity}

Your campaign is under review. We'll notify you within 24-48 hours.

Track status: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard

- IamBillBoard Team`;

    return await this.sendSMS({ to: userPhone, message });
  }

  // Campaign approval SMS
  async sendCampaignApprovalSMS(userPhone: string, campaignData: any): Promise<boolean> {
    const message = `✅ Great News! Campaign APPROVED!

Campaign ID: ${campaignData.campaignId}
Status: APPROVED ✅

Production will start within 24 hours. You'll receive design preview shortly via WhatsApp/SMS.

Track progress: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard

Thank you for choosing IamBillBoard!
- Team IamBillBoard`;

    return await this.sendSMS({ to: userPhone, message });
  }

  // Campaign rejection SMS  
  async sendCampaignRejectionSMS(userPhone: string, campaignData: any, rejectionReason?: string): Promise<boolean> {
    const message = `📝 Campaign Update Required

Campaign ID: ${campaignData.campaignId}
Status: Needs Updates

${rejectionReason ? `Reason: ${rejectionReason}` : ''}

Please review and resubmit your campaign. Contact support if you need assistance.

Support: support@iambillboard.com
Dashboard: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard

- IamBillBoard Team`;

    return await this.sendSMS({ to: userPhone, message });
  }

  // Production status SMS notifications
  async sendProductionStatusSMS(userPhone: string, campaignData: any, status: 'production_started' | 'in_progress' | 'shipped' | 'delivered'): Promise<boolean> {
    const statusMessages = {
      production_started: {
        emoji: '🏭',
        title: 'Production Started!',
        message: 'Great news! Production of your custom bottles has officially started.'
      },
      in_progress: {
        emoji: '📦',
        title: 'Production In Progress',
        message: 'Your custom bottles are being crafted with care and precision.'
      },
      shipped: {
        emoji: '🚛',
        title: 'On The Way!',
        message: 'Your bottles have been shipped and are heading to stores in your area.'
      },
      delivered: {
        emoji: '✅',
        title: 'Campaign Complete!',
        message: 'Success! Your bottles have been delivered to stores and your campaign is now LIVE!'
      }
    };

    const statusInfo = statusMessages[status];
    
    const message = `${statusInfo.emoji} ${statusInfo.title}

Campaign ID: ${campaignData.campaignId}
${statusInfo.message}

${status === 'delivered' ? 'Your advertising campaign is now active in stores!' : 'Track real-time progress on dashboard.'}

Dashboard: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard

- IamBillBoard Team`;

    return await this.sendSMS({ to: userPhone, message });
  }

  // Order confirmation SMS (for checkout process)
  async sendOrderConfirmationSMS(userPhone: string, orderData: any): Promise<boolean> {
    const message = `🛒 Order Confirmed - IamBillBoard

Order ID: ${orderData.orderId}
Amount: ₹${orderData.totalAmount?.toLocaleString()}
Payment: ${orderData.paymentStatus}

${orderData.items ? `Items: ${orderData.items}` : ''}
Delivery: ${orderData.address}

You'll receive campaign details shortly.

Track: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard

- IamBillBoard Team`;

    return await this.sendSMS({ to: userPhone, message });
  }

  // Payment success SMS
  async sendPaymentSuccessSMS(userPhone: string, paymentData: any): Promise<boolean> {
    const message = `💳 Payment Successful!

Amount: ₹${paymentData.amount?.toLocaleString()}
Payment ID: ${paymentData.paymentId}
Method: ${paymentData.method}

Your campaign will be processed shortly. Expect an update within 2-4 hours.

Dashboard: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard

- IamBillBoard Team`;

    return await this.sendSMS({ to: userPhone, message });
  }

  // Welcome SMS for new users
  async sendWelcomeSMS(userPhone: string, userName: string): Promise<boolean> {
    const message = `🎉 Welcome to IamBillBoard, ${userName}!

India's #1 Custom Bottle Advertising Platform

✓ Professional bottle designs
✓ Pan-India distribution
✓ Real-time campaign tracking
✓ 24/7 support

Start your first campaign: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/dashboard

Need help? Reply to this SMS or email: support@iambillboard.com

- Team IamBillBoard`;

    return await this.sendSMS({ to: userPhone, message });
  }

  // Payment failure SMS
  async sendPaymentFailureSMS(userPhone: string, paymentData: any): Promise<boolean> {
    const message = `❌ Payment Failed - IamBillBoard

Order ID: ${paymentData.orderId || 'N/A'}
Amount: ₹${paymentData.amount?.toLocaleString() || '0'}
Reason: ${paymentData.failureReason || 'Payment processing failed'}

Please try again with a different payment method or contact support.

Retry: ${process.env.FRONTEND_URL || 'https://iambillboard.com'}/checkout
Support: support@iambillboard.com

- IamBillBoard Team`;

    return await this.sendSMS({ to: userPhone, message });
  }

  // Test SMS with custom configuration
  async sendTestSMS(testNumber: string, config: any): Promise<boolean> {
    if (!config?.twilioAccountSid || !config?.twilioAuthToken || !config?.twilioFromNumber) {
      console.error('Test SMS failed: Missing Twilio configuration');
      return false;
    }

    try {
      // Create temporary client with provided config
      const testClient = twilio(config.twilioAccountSid, config.twilioAuthToken);
      
      // Format phone number
      const phoneNumber = this.formatIndianPhoneNumber(testNumber);
      
      // Send test message
      const message = await testClient.messages.create({
        body: '🎯 IamBillBoard Test SMS - Your notification system is working perfectly! This confirms SMS setup is successful.',
        from: config.twilioFromNumber,
        to: phoneNumber
      });

      console.log(`Test SMS sent successfully to ${phoneNumber}. SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send test SMS:', error);
      return false;
    }
  }

  // Send password reset OTP via SMS
  async sendPasswordResetOTP(phone: string, username: string, otp: string): Promise<boolean> {
    const cleanedPhone = this.formatIndianPhoneNumber(phone);
    
    const message = `🔐 Password Reset OTP for ${username}: ${otp}

This OTP is valid for 10 minutes only.
Never share this code with anyone.

If you didn't request this, please ignore this message.

- IamBillBoard Security Team`;
    
    return this.sendSMS({
      to: cleanedPhone,
      message
    });
  }
}

export const smsService = new SMSService();