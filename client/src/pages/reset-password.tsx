import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get token from URL safely
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const emailParam = urlParams.get('email');
    setToken(tokenParam);
    setEmail(emailParam);
    setLoading(false);
  }, []);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Check if token is valid after loading
  useEffect(() => {
    if (!loading && (!token || !email)) {
      setInvalidToken(true);
    }
  }, [token, email, loading]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const response = await fetch("/api/reset-password-with-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
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
      setSuccess(true);
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated. You can now sign in with your new password.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    resetPasswordMutation.mutate(data);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-950 dark:via-pink-950 dark:to-red-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <CardContent className="text-center p-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading reset page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token page
  if (invalidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-950 dark:via-pink-950 dark:to-red-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <CardContent className="text-center p-8">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This password reset link is invalid or has expired. Please request a new reset link.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation("/forgot-password")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Request New Reset Link
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/signin")}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success page
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-950 dark:via-pink-950 dark:to-red-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <CardContent className="text-center p-8">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Updated!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Button 
              onClick={() => setLocation("/signin")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Reset Password Form */}
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Password
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your new password"
                          className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your new password"
                          className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </Form>

            {/* Security Notice */}
            <Alert className="mt-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Security Tips:</strong> Choose a password that's at least 6 characters long and includes a mix of letters, numbers, and symbols for better security.
              </AlertDescription>
            </Alert>

            {/* Footer */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remember your password?
              </p>
              <Link href="/signin" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}