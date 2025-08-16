import Razorpay from 'razorpay';
import { storage } from './storage';

interface PaymentOrder {
  amount: number;
  currency: string;
  receipt: string;
  notes?: any;
}

interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
  paymentData?: any;
}

export class PaymentGatewayService {
  
  async createPaymentOrder(orderData: PaymentOrder): Promise<PaymentResult> {
    try {
      const activeGateway = await storage.getActivePaymentGateway();
      
      if (!activeGateway) {
        // Fallback to simulation if no gateway configured
        return this.simulatePaymentOrder(orderData);
      }

      switch (activeGateway.gateway) {
        case 'razorpay':
          return await this.createRazorpayOrder(orderData, activeGateway);
        case 'payu':
          return await this.createPayUOrder(orderData, activeGateway);
        case 'stripe':
          return await this.createStripeOrder(orderData, activeGateway);
        default:
          return this.simulatePaymentOrder(orderData);
      }
    } catch (error: any) {
      console.error('Payment gateway error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  private async createRazorpayOrder(orderData: PaymentOrder, gateway: any): Promise<PaymentResult> {
    try {
      if (!gateway.keyId || !gateway.keySecret) {
        throw new Error('Razorpay credentials not configured');
      }

      const instance = new Razorpay({
        key_id: gateway.keyId,
        key_secret: gateway.keySecret,
      });

      const order = await instance.orders.create({
        amount: Math.round(orderData.amount * 100), // Convert to paise
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
        notes: orderData.notes || {},
      });

      return {
        success: true,
        orderId: order.id,
        paymentData: {
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          gateway: 'razorpay',
          keyId: gateway.keyId, // Public key for frontend
          options: {
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
          }
        }
      };
    } catch (error: any) {
      console.error('Razorpay error:', error);
      return {
        success: false,
        error: `Razorpay error: ${error.message}`
      };
    }
  }

  private async createPayUOrder(orderData: PaymentOrder, gateway: any): Promise<PaymentResult> {
    // PayU integration placeholder - would need PayU SDK
    try {
      if (!gateway.keyId || !gateway.keySecret) {
        throw new Error('PayU credentials not configured');
      }

      // PayU requires different parameters and flow
      const payuOrderId = `PAYU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        orderId: payuOrderId,
        paymentData: {
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          receipt: orderData.receipt,
          gateway: 'payu',
          merchantKey: gateway.keyId,
          options: {
            txnid: payuOrderId,
            amount: orderData.amount,
            productinfo: 'Custom Bottle Order',
          }
        }
      };
    } catch (error: any) {
      console.error('PayU error:', error);
      return {
        success: false,
        error: `PayU error: ${error.message}`
      };
    }
  }

  private async createStripeOrder(orderData: PaymentOrder, gateway: any): Promise<PaymentResult> {
    // Stripe integration placeholder - would need Stripe SDK
    try {
      if (!gateway.keyId || !gateway.keySecret) {
        throw new Error('Stripe credentials not configured');
      }

      const stripeOrderId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        orderId: stripeOrderId,
        paymentData: {
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          receipt: orderData.receipt,
          gateway: 'stripe',
          publishableKey: gateway.keyId,
          options: {
            payment_intent_id: stripeOrderId,
            amount: Math.round(orderData.amount * 100), // Convert to cents
            currency: orderData.currency || 'inr',
          }
        }
      };
    } catch (error: any) {
      console.error('Stripe error:', error);
      return {
        success: false,
        error: `Stripe error: ${error.message}`
      };
    }
  }

  private simulatePaymentOrder(orderData: PaymentOrder): PaymentResult {
    // Enhanced payment simulation with realistic behavior
    const simulationOrderId = `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      orderId: simulationOrderId,
      paymentData: {
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
        gateway: 'simulation',
        options: {
          order_id: simulationOrderId,
          amount: Math.round(orderData.amount * 100),
          currency: orderData.currency || 'INR',
        }
      }
    };
  }

  async verifyPayment(paymentId: string, orderId: string, signature?: string): Promise<PaymentResult> {
    try {
      const activeGateway = await storage.getActivePaymentGateway();
      
      if (!activeGateway) {
        // Simulate payment verification
        const isSuccessful = Math.random() > 0.15; // 85% success rate
        return {
          success: isSuccessful,
          paymentData: {
            paymentId,
            orderId,
            status: isSuccessful ? 'captured' : 'failed',
            gateway: 'simulation'
          }
        };
      }

      switch (activeGateway.gateway) {
        case 'razorpay':
          return await this.verifyRazorpayPayment(paymentId, orderId, signature, activeGateway);
        case 'payu':
          return await this.verifyPayUPayment(paymentId, orderId, activeGateway);
        case 'stripe':
          return await this.verifyStripePayment(paymentId, orderId, activeGateway);
        default:
          return {
            success: Math.random() > 0.15,
            paymentData: { paymentId, orderId, status: 'simulated' }
          };
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Payment verification failed'
      };
    }
  }

  private async verifyRazorpayPayment(paymentId: string, orderId: string, signature: string | undefined, gateway: any): Promise<PaymentResult> {
    try {
      const instance = new Razorpay({
        key_id: gateway.keyId,
        key_secret: gateway.keySecret,
      });

      // Verify payment signature if provided
      if (signature) {
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', gateway.keySecret)
          .update(orderId + '|' + paymentId)
          .digest('hex');

        if (expectedSignature !== signature) {
          return {
            success: false,
            error: 'Payment signature verification failed'
          };
        }
      }

      // Fetch payment details from Razorpay
      const payment = await instance.payments.fetch(paymentId);
      
      return {
        success: payment.status === 'captured',
        paymentData: {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: Number(payment.amount) / 100, // Convert from paise
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          gateway: 'razorpay'
        }
      };
    } catch (error: any) {
      console.error('Razorpay verification error:', error);
      return {
        success: false,
        error: `Razorpay verification failed: ${error.message}`
      };
    }
  }

  private async verifyPayUPayment(paymentId: string, orderId: string, gateway: any): Promise<PaymentResult> {
    // PayU verification placeholder
    try {
      // In real implementation, would verify with PayU API
      return {
        success: true,
        paymentData: {
          paymentId,
          orderId,
          status: 'success',
          gateway: 'payu'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `PayU verification failed: ${error.message}`
      };
    }
  }

  private async verifyStripePayment(paymentId: string, orderId: string, gateway: any): Promise<PaymentResult> {
    // Stripe verification placeholder
    try {
      // In real implementation, would verify with Stripe API
      return {
        success: true,
        paymentData: {
          paymentId,
          orderId,
          status: 'succeeded',
          gateway: 'stripe'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Stripe verification failed: ${error.message}`
      };
    }
  }
}

export const paymentGateway = new PaymentGatewayService();