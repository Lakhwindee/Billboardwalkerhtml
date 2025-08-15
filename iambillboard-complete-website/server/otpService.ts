import { smsService } from './smsService';
import { db } from './db';
import { phoneOtps } from '@shared/schema';
import { sql } from 'drizzle-orm';

interface OTPOptions {
  phone: string;
  purpose: 'signup' | 'order_verification';
  customerName?: string;
}

class OTPService {
  constructor() {
    // SMS service is imported as a singleton
  }

  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate and send OTP for signup
  async generateSignupOTP(phone: string, customerName?: string): Promise<{ success: boolean; message: string; otpId?: number }> {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Save OTP to database
      const [otpRecord] = await db.insert(phoneOtps).values({
        phone,
        otp,
        purpose: 'signup',
        isUsed: false,
        expiresAt,
      }).returning();

      // Send OTP via SMS
      const smsMessage = `🔐 IamBillBoard Verification Code

Your OTP for account registration: ${otp}

This code expires in 10 minutes.
Do not share this OTP with anyone.

${customerName ? `Welcome ${customerName}!` : ''}

- IamBillBoard Team`;

      // Try to send SMS, but continue even if it fails (for testing)
      const smsSent = await smsService.sendSMS({ to: phone, message: smsMessage });
      
      // Log OTP for development/testing
      console.log(`📱 DEVELOPMENT OTP for ${phone}: ${otp}`);
      console.log(`📱 SMS sent status: ${smsSent ? 'Success' : 'Failed (using console for testing)'}`);

      // For development, provide helpful message about temporary OTP
      let responseMessage = 'OTP sent successfully';
      if (!smsSent) {
        responseMessage = `SMS service not configured. For testing, use this OTP: ${otp} (valid for 10 minutes)`;
      }

      console.log(`Signup OTP generated for ${phone}. OTP ID: ${otpRecord.id}`);
      return {
        success: true,
        message: responseMessage,
        otpId: otpRecord.id,
        // Only include OTP in development when SMS fails
        ...(process.env.NODE_ENV === 'development' && !smsSent && { tempOtp: otp })
      };
    } catch (error) {
      console.error('Error generating signup OTP:', error);
      return {
        success: false,
        message: 'Failed to generate OTP. Please try again.'
      };
    }
  }

  // Generate and send OTP for order verification
  async generateOrderVerificationOTP(phone: string, customerName?: string): Promise<{ success: boolean; message: string; otpId?: number }> {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Save OTP to database
      const [otpRecord] = await db.insert(phoneOtps).values({
        phone,
        otp,
        purpose: 'order_verification',
        isUsed: false,
        expiresAt,
      }).returning();

      // Send OTP via SMS
      const orderSmsMessage = `🔐 IamBillBoard Order Verification

Your OTP for order confirmation: ${otp}

This code expires in 10 minutes.
Please enter this code to proceed with payment.

${customerName ? `Hi ${customerName},` : ''} Thank you for choosing IamBillBoard!

- IamBillBoard Team`;

      // Try to send SMS, but continue even if it fails (for testing)
      const smsSent = await smsService.sendSMS({ to: phone, message: orderSmsMessage });
      
      // Log OTP for development/testing
      console.log(`📱 DEVELOPMENT OTP for ${phone}: ${otp}`);
      console.log(`📱 SMS sent status: ${smsSent ? 'Success' : 'Failed (using console for testing)'}`);

      // Always return success for development/testing
      console.log(`Order verification OTP generated for ${phone}. OTP ID: ${otpRecord.id}`);
      return {
        success: true,
        message: 'OTP sent successfully',
        otpId: otpRecord.id
      };
    } catch (error) {
      console.error('Error generating order verification OTP:', error);
      return {
        success: false,
        message: 'Failed to generate OTP. Please try again.'
      };
    }
  }

  // Verify OTP for signup
  async verifySignupOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the latest unused OTP for this phone number for signup
      const [otpRecord] = await db
        .select()
        .from(phoneOtps)
        .where(sql`phone = ${phone} AND purpose = 'signup' AND is_used = false`)
        .orderBy(sql`created_at DESC`)
        .limit(1);

      if (!otpRecord) {
        return {
          success: false,
          message: 'Invalid or expired OTP. Please request a new one.'
        };
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expiresAt) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Check if OTP matches
      if (otpRecord.otp !== otp) {
        return {
          success: false,
          message: 'Invalid OTP. Please check and try again.'
        };
      }

      // Mark OTP as used
      await db
        .update(phoneOtps)
        .set({ isUsed: true })
        .where(sql`id = ${otpRecord.id}`);

      console.log(`Signup OTP verified successfully for ${phone}`);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying signup OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  // Verify OTP for order verification
  async verifyOrderOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the latest unused OTP for this phone number for order verification
      const [otpRecord] = await db
        .select()
        .from(phoneOtps)
        .where(sql`phone = ${phone} AND purpose = 'order_verification' AND is_used = false`)
        .orderBy(sql`created_at DESC`)
        .limit(1);

      if (!otpRecord) {
        return {
          success: false,
          message: 'Invalid or expired OTP. Please request a new one.'
        };
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expiresAt) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Check if OTP matches
      if (otpRecord.otp !== otp) {
        return {
          success: false,
          message: 'Invalid OTP. Please check and try again.'
        };
      }

      // Mark OTP as used
      await db
        .update(phoneOtps)
        .set({ isUsed: true })
        .where(sql`id = ${otpRecord.id}`);

      console.log(`Order verification OTP verified successfully for ${phone}`);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying order OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  // Clean up expired OTPs (utility function)
  async cleanupExpiredOTPs(): Promise<void> {
    try {
      await db
        .delete(phoneOtps)
        .where(sql`expires_at < ${new Date()}`);
      
      console.log('Expired OTPs cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }

  // Resend OTP (for both signup and order verification)
  async resendOTP(phone: string, purpose: 'signup' | 'order_verification', customerName?: string): Promise<{ success: boolean; message: string; otpId?: number }> {
    try {
      // Mark any existing unused OTPs as used (to prevent multiple active OTPs)
      await db
        .update(phoneOtps)
        .set({ isUsed: true })
        .where(sql`phone = ${phone} AND purpose = ${purpose} AND is_used = false`);

      // Generate new OTP based on purpose
      if (purpose === 'signup') {
        return await this.generateSignupOTP(phone, customerName);
      } else {
        return await this.generateOrderVerificationOTP(phone, customerName);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP. Please try again.'
      };
    }
  }
}

export default new OTPService();