import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Phone, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';

interface PhoneOTPVerificationProps {
  phone: string;
  customerName?: string;
  purpose: 'signup' | 'order_verification';
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export default function PhoneOTPVerification({
  phone,
  customerName,
  purpose,
  onSuccess,
  onCancel,
  title,
  description
}: PhoneOTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send OTP when component mounts
  useEffect(() => {
    sendOTP();
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const endpoint = purpose === 'signup' 
        ? '/api/otp/signup/generate'
        : '/api/otp/order/generate';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, customerName })
      });

      const result = await response.json();
      
      if (result.success) {
        setOtpSent(true);
        setSuccess('OTP sent successfully to your phone number');
        setCountdown(60); // 60 seconds countdown for resend
        // Focus on first input
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      setError('Failed to send OTP. Please try again.');

    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setIsResending(true);
      setError('');
      setOtp(['', '', '', '', '', '']);
      
      const response = await fetch('/api/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose, customerName })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('OTP resent successfully');
        setCountdown(60);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      setError('Failed to resend OTP. Please try again.');

    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const endpoint = purpose === 'signup' 
        ? '/api/otp/signup/verify'
        : '/api/otp/order/verify';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpString })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      setError('Failed to verify OTP. Please try again.');

    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      verifyOTP();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Focus on last input
      inputRefs.current[5]?.focus();
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display (e.g., +91 98765 43210)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <CardTitle className="text-xl">
          {title || (purpose === 'signup' ? 'Verify Your Phone Number' : 'Order Verification Required')}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {description || `We've sent a 6-digit code to ${formatPhoneNumber(phone)}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* OTP Input Fields */}
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-blue-500"
              disabled={isLoading}
              data-testid={`otp-input-${index}`}
            />
          ))}
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resend OTP */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-gray-500">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={resendOTP}
              disabled={isResending || !otpSent}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="resend-otp-button"
            >
              {isResending ? (
                <span className="flex items-center justify-center gap-1">
                  <RotateCcw className="h-3 w-3 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Resend OTP'
              )}
            </button>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <Button
          onClick={verifyOTP}
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full"
          data-testid="verify-otp-button"
        >
          {isLoading ? 'Verifying...' : 'Verify & Continue'}
        </Button>
        
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full"
            data-testid="cancel-otp-button"
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}