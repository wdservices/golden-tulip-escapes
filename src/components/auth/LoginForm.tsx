import { useState, useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Define separate schemas for login and register
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
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


export const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/booking";

  // Use the appropriate schema based on login/register mode
  const schema = isLogin ? loginSchema : registerSchema;
  const fields = isLogin ? loginFields : registerFields;
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLogin ? {} : { name: "", phone: "" }),
    },
  });

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset,
    trigger,
    getValues,
  } = form;

  const onSubmit = async (data: FormData) => {
    try {
      if (isLogin) {
        const { email, password } = data as LoginFormData;
        await login(email, password);
      } else {
        const { name, email, phone, password } = data as RegisterFormData;
        await registerUser(name, email, phone, password);
      }
      // Navigation will be handled by the AuthContext after successful login/register
    } catch (err) {
      console.error("Authentication error:", err);
    }
  };

  const toggleAuthMode = () => {
    const wasLogin = isLogin;
    const currentEmail = getValues("email");
    
    // Reset form with new default values based on the new mode
    reset({
      email: currentEmail,
      password: "",
      ...(wasLogin ? { name: "", phone: "" } : {}),
    });
    
    // Toggle mode after reset
    setIsLogin(!wasLogin);
    
    // Re-validate the form after mode change
    setTimeout(() => trigger());
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg bg-card shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-gradient-gold mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-muted-foreground">
          {isLogin 
            ? "Sign in to continue to your account" 
            : "Create an account to book your stay"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => {
          const fieldName = field.name as keyof FormData;
          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
              </Label>
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                disabled={isLoading}
                {...register(fieldName as any)}
              />
              {errors[fieldName] && (
                <p className="text-sm text-red-500">
                  {errors[fieldName]?.message as string}
                </p>
              )}
            </div>
          );
        })}

        {isLogin && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => navigate("/forgot-password")}
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
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

      <div className="mt-6 text-center text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={toggleAuthMode}
          className="font-medium text-primary hover:underline"
          disabled={isLoading}
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>
    </div>
  );
};
