import { emailService } from './emailService';
import { db } from './db';
import { emailVerifications } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

class EmailVerificationService {
  // Generate a secure verification token
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send email verification OTP for signup
  async sendVerificationEmail(email: string, firstName: string, gmailConfig?: any): Promise<{ success: boolean; message: string; verificationId?: number; tempOtp?: string }> {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save verification record to database
      const [verificationRecord] = await db.insert(emailVerifications).values({
        email,
        otp,
        isUsed: false,
        expiresAt,
      }).returning();

      // Email content for OTP verification
      const emailSubject = 'IamBillBoard - Email Verification Code';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎯 IamBillBoard</h1>
            <p style="color: #e0e7ff; margin: 5px 0;">Custom Bottle Advertising Platform</p>
          </div>
          
          <div style="background: white; color: #333; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <h2 style="color: #667eea; margin: 0 0 20px 0;">Email Verification Required</h2>
            
            <p>Hello ${firstName},</p>
            
            <p>Welcome to IamBillBoard! To complete your account registration, please verify your email address using the code below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 10px; letter-spacing: 3px; display: inline-block;">
                ${otp}
              </div>
            </div>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0; color: #666;"><strong>Important:</strong></p>
              <ul style="margin: 10px 0; color: #666;">
                <li>This code expires in 15 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>Enter this code on the verification page to activate your account</li>
              </ul>
            </div>
            
            <p>If you didn't create an account with IamBillBoard, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 14px;">
              <p>Best regards,<br><strong style="color: #667eea;">IamBillBoard Team</strong></p>
              <p>Custom Bottle Advertising Solutions</p>
            </div>
          </div>
        </div>
      `;

      // Send verification email using Gmail integration
      console.log(`📧 Sending Gmail OTP verification to ${email}: ${otp}`);
      console.log(`📧 Gmail config provided: ${gmailConfig ? 'Yes' : 'No'}`);
      
      const emailSent = await emailService.sendOTPEmail(email, otp, firstName, gmailConfig);

      console.log(`📧 Gmail OTP sent status: ${emailSent ? 'Success' : 'Failed'}`);

      // Return appropriate message based on success
      if (emailSent) {
        return {
          success: true,
          message: 'Verification email sent successfully to your inbox',
          verificationId: verificationRecord.id
        };
      } else {
        // If Gmail fails, provide the OTP for development/testing
        return {
          success: true,
          message: `Gmail service not configured. For testing, use this OTP: ${otp} (valid for 15 minutes)`,
          verificationId: verificationRecord.id,
          // Include OTP in development when email fails
          ...(process.env.NODE_ENV === 'development' && { tempOtp: otp })
        };
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      // For deployed sites without Gmail config, provide the OTP for manual verification
      // Generate fallback OTP and record if they're not available
      const fallbackOtp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const [fallbackRecord] = await db.insert(emailVerifications).values({
        email,
        otp: fallbackOtp,
        isUsed: false,
        expiresAt,
      }).returning();
      
      return {
        success: true,
        message: `Email service not configured on deployed site. For testing, use this OTP: ${fallbackOtp} (valid for 15 minutes)`,
        verificationId: fallbackRecord.id,
        tempOtp: fallbackOtp
      };
    }
  }

  // Verify email OTP
  async verifyEmailOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the most recent verification record for this email
      const [verificationRecord] = await db
        .select()
        .from(emailVerifications)
        .where(
          and(
            eq(emailVerifications.email, email),
            eq(emailVerifications.isUsed, false)
          )
        )
        .orderBy(desc(emailVerifications.createdAt))
        .limit(1);

      if (!verificationRecord) {
        return {
          success: false,
          message: 'No verification request found for this email'
        };
      }

      // Check if already used (this check is redundant now since we filter by isUsed = false)
      if (verificationRecord.isUsed) {
        return {
          success: false,
          message: 'This verification code has already been used'
        };
      }

      // Check if expired
      if (new Date() > verificationRecord.expiresAt) {
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one'
        };
      }

      // Verify OTP
      if (verificationRecord.otp !== otp) {
        return {
          success: false,
          message: 'Invalid verification code. Please check and try again'
        };
      }

      // Mark as used
      await db
        .update(emailVerifications)
        .set({ isUsed: true })
        .where(eq(emailVerifications.id, verificationRecord.id));

      console.log(`✅ Email verification successful for ${email}`);
      
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again'
      };
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string, firstName: string): Promise<{ success: boolean; message: string }> {
    try {
      // Mark any existing verification as used to prevent reuse
      await db
        .update(emailVerifications)
        .set({ isUsed: true })
        .where(eq(emailVerifications.email, email));

      // Send new verification email
      const result = await this.sendVerificationEmail(email, firstName);
      return result;
    } catch (error) {
      console.error('Error resending verification email:', error);
      return {
        success: false,
        message: 'Failed to resend verification email'
      };
    }
  }
}

export const emailVerificationService = new EmailVerificationService();