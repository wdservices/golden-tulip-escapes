import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
// Remove ChatbotFloatingButton import
// import { ChatbotFloatingButton } from "@/components/chat/ChatbotFloatingButton";
import { lazy, Suspense } from 'react';
import Index from "./pages/Index";
import { BookPage } from "./pages/BookPage";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminLoading } from "./components/admin/AdminLoading";
import { AuthPage } from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "react-error-boundary";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { UserDashboard } from "./pages/UserDashboard";
import { BranchPage } from "./pages/BranchPage";
import RoomPage from "./pages/rooms/RoomPage";
import { RoomDetailPage } from "./pages/branches/RoomDetailPage";
import { HallDetailPage } from "./pages/branches/HallDetailPage";
import PublicRoomsPage from "./pages/RoomsPage";
import CorporateHallsPage from "./pages/CorporateHallsPage";
import { Button } from "@/components/ui/button";
import { AdminPanel } from "./components/admin/AdminPanel";


// Lazy load admin components
const BookingsPage = lazy(() => import("@/pages/admin/BookingsPage"));
const AdminRoomsPage = lazy(() => import("@/pages/admin/RoomsPage"));
const ClientsPage = lazy(() => import("@/pages/admin/ClientsPage"));
const MarketingPage = lazy(() => import("@/pages/admin/MarketingPage"));
const PaymentsPage = lazy(() => import("@/pages/admin/PaymentsPage"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const BranchesPage = lazy(() => import("@/pages/admin/BranchesPage"));
const SettingsPage = lazy(() => import("@/pages/admin/settings/SettingsPage"));
const DashboardHome = lazy(() => import("@/pages/admin/DashboardHome"));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
    <AdminLoading size={48} />
    <p className="mt-4 text-muted-foreground">Loading page content...</p>
  </div>
);



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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <DatabaseProvider>
              {/* Remove ChatbotFloatingButton component */}
              {/* <ChatbotFloatingButton /> */}
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/branch/:branchId" element={<BranchPage />} />
            <Route path="/branches/:branchId" element={<BranchPage />} />
            <Route path="/branch/:branchId/room/:roomId" element={<RoomDetailPage />} />
            <Route path="/branch/:branchId/hall/:hallId" element={<HallDetailPage />} />
            <Route path="/rooms" element={<PublicRoomsPage />} />
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
                  <AdminRoomsPage />
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
              {/* User Management and Pricing routes removed */}
            </Route>
            {/* 404 - Keep this last */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </DatabaseProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
