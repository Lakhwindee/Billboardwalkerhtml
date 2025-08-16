import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, Phone, Mail } from 'lucide-react';

interface PaymentFailureData {
  reason: string;
  amount: number;
  paymentMethod: string;
  transactionRef?: string;
  customerName?: string;
  timestamp: string;
}

export default function PaymentFailed() {
  const [, params] = useRoute('/payment-failed/:reason?');
  const [, navigate] = useLocation();
  const [failureData, setFailureData] = useState<PaymentFailureData | null>(null);

  useEffect(() => {
    // Get failure data from localStorage
    const failureInfo = localStorage.getItem('billboardwalker_payment_failure');
    if (failureInfo) {
      setFailureData(JSON.parse(failureInfo));
    } else {
      // Default failure data if no specific info available
      setFailureData({
        reason: params?.reason || 'Payment could not be processed',
        amount: 0,
        paymentMethod: 'Unknown',
        timestamp: new Date().toLocaleString()
      });
    }
  }, [params]);

  const retryPayment = () => {
    // Clear failure data and return to checkout
    localStorage.removeItem('billboardwalker_payment_failure');
    navigate('/checkout');
  };

  const goToDashboard = () => {
    localStorage.removeItem('billboardwalker_payment_failure');
    navigate('/dashboard');
  };

  if (!failureData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Failure Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <XCircle className="w-24 h-24 text-red-500 animate-pulse" />
            <AlertTriangle className="w-8 h-8 text-orange-500 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            We couldn't process your payment at this time
          </p>
        </div>

        {/* Failure Details Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Payment Error</h3>
                <p className="text-red-800 text-sm">
                  {failureData.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-semibold text-gray-800">
                  ₹{failureData.amount?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-semibold text-gray-800">{failureData.paymentMethod}</p>
              </div>
            </div>
            
            {failureData.transactionRef && (
              <div>
                <p className="text-sm text-gray-500">Transaction Reference</p>
                <p className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-700 inline-block">
                  {failureData.transactionRef}
                </p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-500">Timestamp</p>
              <p className="text-sm text-gray-700">{failureData.timestamp}</p>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-3">💡 Common Reasons for Payment Failure</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Insufficient balance in your account</li>
              <li>• Incorrect payment details entered</li>
              <li>• Payment gateway temporarily unavailable</li>
              <li>• Daily transaction limit exceeded</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={retryPayment}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Payment</span>
            </button>
            
            <button
              onClick={goToDashboard}
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-gray-600 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Support Contact */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 text-sm mb-3">Need help with your payment?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">+91 98765 43210</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">support@iambillboard.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}