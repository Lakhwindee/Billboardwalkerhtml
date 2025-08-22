import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Loader2, CheckCircle, KeyRound, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Step 1: Email Schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Step 2: OTP Schema
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Step 3: Password Reset Schema
const passwordResetSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type PasswordResetForm = z.infer<typeof passwordResetSchema>;

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: password
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Step 1: Email Form
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // Step 2: OTP Form
  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Step 3: Password Form
  const passwordForm = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // Step 1: Send OTP Email
  const sendOtpMutation = useMutation({
    mutationFn: async (data: EmailForm) => {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send OTP");
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      setStep(2);
      toast({
        title: "OTP Sent!",
        description: "Check your email for the 6-digit OTP code.",
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Failed to send OTP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Step 2: Verify OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OtpForm) => {
      const response = await fetch("/api/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: email, otp: data.otp }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid OTP");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setStep(3);
      toast({
        title: "OTP Verified!",
        description: "Now set your new password.",
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "OTP Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Step 3: Reset Password
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: PasswordResetForm) => {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail: email,
          resetToken: "verified", // Token not needed after OTP verification
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reset password");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successful!",
        description: "You can now sign in with your new password.",
      });
      setLocation("/signin");
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onEmailSubmit = (data: EmailForm) => {
    setError("");
    sendOtpMutation.mutate(data);
  };

  const onOtpSubmit = (data: OtpForm) => {
    setError("");
    verifyOtpMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordResetForm) => {
    setError("");
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-950 dark:via-pink-950 dark:to-red-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMzYgMzQgNi02IDYgNi02IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] repeat" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/signin" className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
          
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              {step === 1 && <Mail className="h-8 w-8 text-white" />}
              {step === 2 && <KeyRound className="h-8 w-8 text-white" />}
              {step === 3 && <Lock className="h-8 w-8 text-white" />}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Enter OTP Code"}
            {step === 3 && "Set New Password"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Check your email for the 6-digit code"}
            {step === 3 && "Create your new password"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
            <div className={`w-8 h-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
            <div className={`w-8 h-1 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-semibold">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "New Password"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your email address"}
              {step === 2 && `OTP sent to ${email}`}
              {step === 3 && "Choose a strong password"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email address"
                              className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                              autoComplete="email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold"
                    disabled={sendOtpMutation.isPending}
                  >
                    {sendOtpMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: OTP Input */}
            {step === 2 && (
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Enter 6-Digit OTP</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            className="h-12 text-center text-2xl font-mono tracking-widest bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                            autoComplete="one-time-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      disabled={verifyOtpMutation.isPending}
                    >
                      {verifyOtpMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3: Password Reset */}
            {step === 3 && (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter new password"
                            className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Confirm new password"
                            className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Resend OTP option for step 2 */}
            {step === 2 && (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Didn't receive OTP?
                </p>
                <Button
                  variant="link"
                  onClick={() => sendOtpMutation.mutate({ email })}
                  disabled={sendOtpMutation.isPending}
                  className="text-orange-600 hover:text-orange-700"
                >
                  Resend OTP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 IamBillBoard. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}