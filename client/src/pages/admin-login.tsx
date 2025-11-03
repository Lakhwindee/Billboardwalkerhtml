import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, ArrowLeft, Shield, Lock, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Admin username is required"),
  password: z.string().min(1, "Admin password is required"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      const apiUrl = "/api/login";
      
      console.log("🔐 Admin login attempt:", { username: data.username, apiUrl });
      
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(data),
          credentials: "include"
        });
        
        console.log("🔐 Response status:", response.status);
        
        let result;
        try {
          result = await response.json();
          console.log("🔐 Response data:", result);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          throw new Error("Server connection error. Please check your connection and try again.");
        }
        
        if (!response.ok) {
          console.error("🔐 Login failed:", { status: response.status, result });
          if (response.status === 401) {
            throw new Error("Invalid admin credentials");
          } else if (response.status === 400) {
            throw new Error("Please fill in all required fields");
          } else if (response.status >= 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error(result.error || result.message || "Admin login failed");
          }
        }
        
        // Check if user is admin or campaign_manager
        if (result.user?.role !== "admin" && result.user?.role !== "campaign_manager") {
          throw new Error("Access denied. This login is for administrators only.");
        }
        
        console.log("🔐 Admin login successful:", result);
        return result;
      } catch (fetchError) {
        console.error("Admin login fetch error:", fetchError);
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          throw new Error("Network connection error. Please check your internet connection.");
        }
        throw fetchError;
      }
    },
    onSuccess: (data) => {
      setError("");
      
      // Store auth token in localStorage for iframe compatibility
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        console.log('✅ Auth token stored in localStorage');
      }
      
      // Invalidate current user query to refresh authentication state
      queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
      
      toast({
        title: "Admin access granted!",
        description: `Welcome back, ${data.user?.username}`,
      });
      
      // Redirect to admin panel
      setTimeout(() => {
        if (data.user?.role === "admin") {
          setLocation("/admin");
        } else if (data.user?.role === "campaign_manager") {
          setLocation("/admin?tab=campaigns");
        }
      }, 500);
    },
    onError: (error: Error) => {
      setError(error.message);
      
      // Different toast messages based on error type
      if (error.message.includes("Invalid") || error.message.includes("Access denied")) {
        toast({
          title: "Admin login failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (error.message.includes("Network") || error.message.includes("connection")) {
        toast({
          title: "Connection error",
          description: "Please check your internet connection",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Admin login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: AdminLoginForm) => {
    setError("");
    adminLoginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMzYgMzQgNi02IDYgNi02IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] repeat" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-300 hover:text-white mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Access
          </h1>
          <p className="text-gray-300">
            Authorized personnel only
          </p>
        </div>

        {/* Admin Login Card */}
        <Card className="shadow-2xl border-0 bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg border border-purple-500/20">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-white">Administrator Login</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your admin credentials to access the control panel
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-900/20 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="form-admin-login">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Admin Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            placeholder="Enter admin username"
                            className="pl-10 bg-white/5 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
                            disabled={adminLoginMutation.isPending}
                            data-testid="input-username"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Admin Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter admin password"
                            className="pl-10 pr-10 bg-white/5 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
                            disabled={adminLoginMutation.isPending}
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                            disabled={adminLoginMutation.isPending}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50"
                  disabled={adminLoginMutation.isPending}
                  data-testid="button-admin-login"
                >
                  {adminLoginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Access Admin Panel
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              <p className="text-gray-400">
                Not an admin?{" "}
                <Link href="/signin" className="text-purple-400 hover:text-purple-300 font-medium">
                  Regular User Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Restricted access. All login attempts are monitored.</p>
        </div>
      </div>
    </div>
  );
}
