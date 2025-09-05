import { LoginForm } from "@/components/auth/LoginForm";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthPage = () => {
  const { setupNavigation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setupNavigation(navigate);
  }, [navigate, setupNavigation]);
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
};
