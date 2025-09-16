import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { BookPage } from "./pages/BookPage";
import BookingPage from "./pages/BookingPage";
import { lazy, Suspense } from 'react';
import AdminDashboard from "./pages/AdminDashboard";
import { AdminLoading } from "./components/admin/AdminLoading";
import { AuthPage } from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "react-error-boundary";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { UserDashboard } from "./pages/UserDashboard";
import { BranchPage } from "./pages/BranchPage";
import { ChatbotFloatingButton } from "./components/chat/ChatbotFloatingButton";
import RoomPage from "./pages/rooms/RoomPage";
import CorporateHallsPage from "./pages/CorporateHallsPage";
import { Button } from "@/components/ui/button";
import { AdminPanel } from "./components/admin/AdminPanel";

// Lazy load admin components
const BookingsPage = lazy(() => import("@/pages/admin/BookingsPage"));
const RoomsPage = lazy(() => import("@/pages/admin/RoomsPage"));
const ClientsPage = lazy(() => import("@/pages/admin/ClientsPage"));
const MarketingPage = lazy(() => import("@/pages/admin/MarketingPage"));
const PaymentsPage = lazy(() => import("@/pages/admin/PaymentsPage"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const BranchesPage = lazy(() => import("@/pages/admin/BranchesPage"));
const SettingsPage = lazy(() => import("@/pages/admin/settings/SettingsPage"));
const PricingManagement = lazy(() => import("@/pages/admin/PricingManagement"));
const DashboardHome = lazy(() => import("@/pages/admin/DashboardHome"));

// Loading component for Suspense fallback
const LoadingFallback = () => <AdminLoading fullScreen={true} size={48} />;



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Error boundary fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div role="alert" className="p-4 max-w-2xl mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <pre className="bg-gray-100 p-4 rounded-md mb-6 text-left overflow-x-auto">
        {error.message}
      </pre>
      <Button onClick={resetErrorBoundary} variant="default">
        Try again
      </Button>
    </div>
  );
};

const App = () => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => window.location.reload()}
  >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DatabaseProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<ChatbotFloatingButton />} />
          </Routes>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/branch/:branchId" element={<BranchPage />} />
            <Route path="/branches/:branchId" element={<BranchPage />} />
            <Route path="/rooms/:id" element={<RoomPage />} />
            <Route path="/corporate-halls" element={<CorporateHallsPage />} />
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            {/* User Dashboard - Only accessible to non-admin users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="user" redirectTo="/auth">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/new-booking" element={<Navigate to="/booking" replace />} />
            {/* Admin Routes - Only accessible to admin users */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
                <AdminDashboard />
              </ProtectedRoute>
            }>
              <Route index element={
                <Suspense fallback={<LoadingFallback />}>
                  <DashboardHome />
                </Suspense>
              } />
              <Route path="bookings" element={
                <Suspense fallback={<LoadingFallback />}>
                  <BookingsPage />
                </Suspense>
              } />
              <Route path="rooms" element={
                <Suspense fallback={<LoadingFallback />}>
                  <RoomsPage />
                </Suspense>
              } />
              <Route path="clients" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ClientsPage />
                </Suspense>
              } />
              <Route path="marketing" element={
                <Suspense fallback={<LoadingFallback />}>
                  <MarketingPage />
                </Suspense>
              } />
              <Route path="payments" element={
                <Suspense fallback={<LoadingFallback />}>
                  <PaymentsPage />
                </Suspense>
              } />
              <Route path="reports" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ReportsPage />
                </Suspense>
              } />
              <Route path="branches" element={
                <Suspense fallback={<LoadingFallback />}>
                  <BranchesPage />
                </Suspense>
              } />
              <Route path="settings/*" element={
                <Suspense fallback={<LoadingFallback />}>
                  <SettingsPage />
                </Suspense>
              } />
              <Route path="users" element={
                <AdminPanel />
              } />
              <Route path="pricing" element={
                <Suspense fallback={<LoadingFallback />}>
                  <PricingManagement />
                </Suspense>
              } />
            </Route>
            {/* 404 - Keep this last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
        </DatabaseProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
