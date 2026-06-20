import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Lock, Mail, User, Phone, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define separate schemas for login and register
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type FormData = LoginFormData | RegisterFormData;

// Helper type to get form field types
type FormField<T> = {
  [K in keyof T]: {
    name: K;
    label: string;
    type: string;
    placeholder: string;
    autoComplete?: string;
  };
}[keyof T][];

// Form field configurations
const loginFields: FormField<LoginFormData> = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "your@email.com",
    autoComplete: "username",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "current-password",
  },
];

const registerFields: FormField<RegisterFormData> = [
  ...loginFields,
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
    autoComplete: "name",
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+1 (555) 123-4567",
    autoComplete: "tel",
  },
];

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register: registerUser, currentUser, userMeta } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rawFrom: any = (location.state as any)?.from;
  const from = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname || "/";

  const schema = isLogin ? loginSchema : registerSchema;
  const fields = isLogin ? loginFields : registerFields;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLogin ? {} : { name: "", phone: "", termsAccepted: false }),
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    trigger,
    getValues,
  } = form as any; // Temporary type assertion to fix TypeScript errors

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isLogin) {
        await login(data.email, data.password);
        // After successful login, currentUser and userMeta will be updated by AuthContext
        // Use useEffect to handle navigation based on currentUser/userMeta changes
      } else {
        // Handle registration
        const registerData = data as RegisterFormData;
        await registerUser(
          registerData.name,
          registerData.email,
          registerData.phone,
          registerData.password
        );
        // After registration, redirect to the dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && !isLoading) {
      let targetPath = from;
      if (from && from.startsWith('/android')) {
        if (userMeta.role === 'hq-admin' || userMeta.role === 'branch-admin') {
          targetPath = '/admin';
        } else {
          targetPath = '/android';
        }
      } else if (userMeta.role === 'hq-admin' || userMeta.role === 'branch-admin') {
        targetPath = '/admin';
      } else if (currentUser.role === 'user') {
        targetPath = '/dashboard';
      }

      if (targetPath && targetPath !== '/auth') {
        navigate(targetPath, { replace: true });
      } else if (window.location.pathname === '/auth') {
        if (userMeta.role === 'hq-admin' || userMeta.role === 'branch-admin') {
          navigate('/admin', { replace: true });
        } else if (currentUser.role === 'user') {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [currentUser, isLoading, navigate, from, userMeta.role]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    reset();
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 space-y-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-gray-600">
          {isLogin ? "Enter your credentials to sign in" : "Create a new account to get started"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="name">Full Name</Label>
            </div>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="email">Email</Label>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {!isLogin && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="phone">Phone Number</Label>
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register("phone")}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="password">Password</Label>
            </div>
            {isLogin && (
              <a
                href="#"
                className="text-sm text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle forgot password
                }}
              >
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {!isLogin && (
          <div className="flex items-start space-x-2">
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="termsAccepted"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  className="mt-1"
                />
              )}
            />
            <Label htmlFor="termsAccepted" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I have read and agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline font-medium">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
            </Label>
          </div>
        )}
        {errors.termsAccepted && (
          <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[hsl(var(--royal-blue))] to-[hsl(var(--royal-blue-dark))] hover:from-[hsl(var(--royal-blue-light))] hover:to-[hsl(var(--royal-blue))] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLogin ? "Signing in..." : "Creating account..."}
            </>
          ) : isLogin ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={toggleAuthMode}
          className="font-semibold text-[hsl(var(--royal-blue))] hover:text-[hsl(var(--royal-blue-light))] hover:underline transition-colors duration-200"
          disabled={isLoading}
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>
    </div>
  );
};
