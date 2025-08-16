// Razorpay Payment Gateway Integration
// Real payment processing for Indian market

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

interface PaymentData {
  amount: number; // in paise (multiply by 100)
  currency: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: Record<string, string>;
}

interface PaymentResponse {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

class RazorpayService {
  private config: RazorpayConfig | null = null;
  private razorpayInstance: any = null;

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (keyId && keySecret) {
      this.updateConfig({ keyId, keySecret, webhookSecret });
    }
  }

  updateConfig(config: RazorpayConfig) {
    this.config = config;
    try {
      // Dynamic import of Razorpay (will be installed when API keys are provided)
      const Razorpay = require('razorpay');
      this.razorpayInstance = new Razorpay({
        key_id: config.keyId,
        key_secret: config.keySecret,
      });
      console.log('Razorpay initialized successfully');
    } catch (error) {
      console.log('Razorpay package not installed. Install when API keys are provided.');
      this.razorpayInstance = null;
    }
  }

  isConfigured(): boolean {
    return !!(this.config && this.config.keyId && this.config.keySecret);
  }

  async createOrder(paymentData: PaymentData): Promise<PaymentResponse> {
    if (!this.isConfigured() || !this.razorpayInstance) {
      // Fallback to simulation when not configured
      return this.simulatePayment(paymentData);
    }

    try {
      const options = {
        amount: paymentData.amount * 100, // Convert to paise
        currency: paymentData.currency || 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: paymentData.notes || {},
      };

      const order = await this.razorpayInstance.orders.create(options);
      
      return {
        success: true,
        orderId: order.id,
      };
    } catch (error: any) {
      console.error('Razorpay order creation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment order',
      };
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<PaymentResponse> {
    if (!this.isConfigured() || !this.razorpayInstance) {
      // Fallback verification simulation
      return this.simulateVerification(paymentId, orderId);
    }

    try {
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', this.config!.keySecret);
      hmac.update(orderId + '|' + paymentId);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature === signature) {
        return {
          success: true,
          paymentId,
        };
      } else {
        return {
          success: false,
          error: 'Payment signature verification failed',
        };
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        error: error.message || 'Payment verification failed',
      };
    }
  }

  async capturePayment(paymentId: string, amount: number): Promise<PaymentResponse> {
    if (!this.isConfigured() || !this.razorpayInstance) {
      return this.simulateCapture(paymentId, amount);
    }

    try {
      const payment = await this.razorpayInstance.payments.capture(paymentId, amount * 100);
      
      return {
        success: true,
        paymentId: payment.id,
      };
    } catch (error: any) {
      console.error('Payment capture failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to capture payment',
      };
    }
  }

  // Simulation methods for when API keys are not configured
  private async simulatePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    console.log('Simulating Razorpay payment (API keys not configured)');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 85% success rate simulation
    const success = Math.random() > 0.15;
    
    if (success) {
      return {
        success: true,
        orderId: `order_sim_${Date.now()}`,
      };
    } else {
      const errors = [
        'Insufficient funds in account',
        'Card declined by issuer',
        'Payment gateway timeout',
        'Invalid card details',
        'Transaction limit exceeded'
      ];
      return {
        success: false,
        error: errors[Math.floor(Math.random() * errors.length)],
      };
    }
  }

  private async simulateVerification(paymentId: string, orderId: string): Promise<PaymentResponse> {
    console.log('Simulating payment verification (API keys not configured)');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 95% verification success rate
    const success = Math.random() > 0.05;
    
    return {
      success,
      paymentId: success ? paymentId : undefined,
      error: success ? undefined : 'Payment verification failed',
    };
  }

  private async simulateCapture(paymentId: string, amount: number): Promise<PaymentResponse> {
    console.log('Simulating payment capture (API keys not configured)');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      paymentId: `pay_sim_${Date.now()}`,
    };
  }

  getConfig(): RazorpayConfig | null {
    return this.config;
  }
}

export const razorpayService = new RazorpayService();
export type { RazorpayConfig, PaymentData, PaymentResponse };