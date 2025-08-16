import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, Sparkles, ArrowRight, Trophy } from 'lucide-react';

interface OrderDetails {
  campaignId: string;
  customerName: string;
  phone: string;
  bottleType: string;
  quantity: number;
  totalAmount: string;
  paymentMethod: string;
  transactionRef: string;
  submittedAt: string;
}

export default function OrderSuccess() {
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const loadOrderDetails = () => {
      // Get order details from localStorage (set during payment process)
      const savedOrderDetails = localStorage.getItem('billboardwalker_order_success');
      if (savedOrderDetails) {
        try {
          const details = JSON.parse(savedOrderDetails);
          setOrderDetails({
            campaignId: details.campaignId || 'BB-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            customerName: details.customerName || 'Customer',
            phone: details.phone || 'N/A',
            bottleType: details.bottleType || '750ml',
            quantity: details.quantity || 1,
            totalAmount: details.totalAmount?.toString() || '0',
            paymentMethod: details.paymentMethod || 'UPI Payment',
            transactionRef: details.transactionRef || 'TXN' + Date.now(),
            submittedAt: details.submittedAt || new Date().toLocaleString()
          });
          // Clear from localStorage after use
          localStorage.removeItem('billboardwalker_order_success');
        } catch (error) {

          // Fallback data
          setOrderDetails({
            campaignId: 'BB-DEFAULT',
            customerName: 'Customer',
            phone: 'N/A',
            bottleType: '750ml',
            quantity: 1,
            totalAmount: '0',
            paymentMethod: 'Payment Completed',
            transactionRef: 'TXN' + Date.now(),
            submittedAt: new Date().toLocaleString()
          });
        }
      } else {
        // Fallback if no localStorage data
        setOrderDetails({
          campaignId: 'BB-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          customerName: 'Customer',
          phone: 'N/A',
          bottleType: '750ml',
          quantity: 1,
          totalAmount: '0',
          paymentMethod: 'Payment Completed',
          transactionRef: 'TXN' + Date.now(),
          submittedAt: new Date().toLocaleString()
        });
      }
    };

    loadOrderDetails();
  }, []);

  useEffect(() => {
    // Start countdown after 2 seconds delay
    const startTimer = setTimeout(() => {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirect to dashboard campaigns section
            navigate('/dashboard?tab=campaigns');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, 2000);

    return () => clearTimeout(startTimer);
  }, [navigate]);

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <CheckCircle2 className="w-24 h-24 text-green-500 animate-bounce" />
            <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            <Trophy className="w-6 h-6 text-orange-500 absolute -bottom-1 -left-2 animate-bounce delay-100" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎉 Congratulations!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your campaign order has been successfully placed!
          </p>
          <p className="text-sm text-gray-500">
            You will receive email and SMS notifications about your order status
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📋 Order Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Campaign ID</p>
                <p className="text-lg font-bold text-blue-600">{orderDetails.campaignId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Customer Name</p>
                <p className="text-lg font-semibold text-gray-800">{orderDetails.customerName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                <p className="text-lg font-semibold text-gray-800">{orderDetails.phone}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Bottle Type</p>
                <p className="text-lg font-semibold text-gray-800">{orderDetails.bottleType}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Quantity</p>
                <p className="text-lg font-semibold text-gray-800">{orderDetails.quantity.toLocaleString()} bottles</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{parseFloat(orderDetails.totalAmount).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 font-medium">Payment Method</p>
                <p className="text-lg font-semibold text-gray-800">{orderDetails.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Order Date</p>
                <p className="text-sm font-semibold text-gray-800">{orderDetails.submittedAt}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 font-medium">Transaction Reference</p>
              <p className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-700 inline-block">
                {orderDetails.transactionRef}
              </p>
            </div>
          </div>
        </div>

        {/* What's Next Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <h3 className="text-xl font-bold mb-3">🚀 What's Next?</h3>
          <div className="space-y-2 text-sm opacity-90">
            <p>• Our team will review your campaign within 24-48 hours</p>
            <p>• You'll receive email and SMS updates about your order status</p>
            <p>• Track your campaign progress in the dashboard</p>
            <p>• Production will begin after admin approval</p>
          </div>
        </div>

        {/* Redirect Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <ArrowRight className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Redirecting to Campaign Studio in {countdown} seconds...
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard?tab=campaigns')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Campaign Studio Now
          </button>
        </div>
      </div>
    </div>
  );
}