import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Smartphone, Key, ArrowLeft } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail: identifier }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        if (data.userId) {
          setUserId(data.userId);
        }
        setStep('verify');
      } else {
        setError(data.error || 'Failed to send reset instructions');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          usernameOrEmail: identifier,
          otp: otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setStep('reset');
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          usernameOrEmail: identifier,
          otp: otp,
          newPassword: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          onClose();
          // Reset the modal state
          setStep('request');
          setIdentifier('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setUserId(null);
          setError('');
          setSuccess('');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('request');
    setIdentifier('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setUserId(null);
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="forgot-password-modal">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 'request' && 'Reset Password'}
            {step === 'verify' && 'Verify OTP'}
            {step === 'reset' && 'Set New Password'}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            data-testid="button-close"
          >
            ✕
          </button>
        </div>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-200" data-testid="error-message">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20">
            <AlertDescription className="text-green-800 dark:text-green-200" data-testid="success-message">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestReset}>
            <div className="mb-4">
              <Label htmlFor="identifier" className="text-gray-700 dark:text-gray-300">
                Username or Email
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username or email"
                required
                className="mt-1"
                data-testid="input-identifier"
              />
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex items-center text-blue-800 dark:text-blue-200 text-sm">
                <Mail className="w-4 h-4 mr-2" />
                <span>You'll receive an OTP via email</span>
              </div>
              <div className="flex items-center text-blue-800 dark:text-blue-200 text-sm mt-1">
                <Smartphone className="w-4 h-4 mr-2" />
                <span>And SMS (if phone number is registered)</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !identifier}
              className="w-full"
              data-testid="button-send-otp"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send Reset OTP'
              )}
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="flex items-center text-blue-600 dark:text-blue-400 text-sm mb-2 hover:underline"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              
              <Label htmlFor="otp" className="text-gray-700 dark:text-gray-300">
                Enter OTP
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
                className="mt-1 text-center text-lg font-mono"
                data-testid="input-otp"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Check your email and SMS for the OTP
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full"
              data-testid="button-verify-otp"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="flex items-center text-blue-600 dark:text-blue-400 text-sm mb-2 hover:underline"
                data-testid="button-back-verify"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              
              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="mt-1"
                data-testid="input-new-password"
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="mt-1"
                data-testid="input-confirm-password"
              />
            </div>

            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <div className="flex items-center text-green-800 dark:text-green-200 text-sm">
                <Key className="w-4 h-4 mr-2" />
                <span>Password must be at least 6 characters long</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full"
              data-testid="button-reset-password"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}