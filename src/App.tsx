import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { AdProvider } from "@/contexts/AdContext";
import { ConditionalChatbot } from "@/components/chat/ConditionalChatbot";
import { lazy, Suspense } from 'react';
import Index from "./pages/Index";
import { AdminLoading } from "./components/admin/AdminLoading";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "react-error-boundary";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";

// Lazy load non-critical pages to keep the initial bundle small and the landing page fast.
const BookPage = lazy(() => import("./pages/BookPage").then(m => ({ default: m.BookPage })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AuthPage = lazy(() => import("./pages/AuthPage").then(m => ({ default: m.AuthPage })));
const UserDashboard = lazy(() => import("./pages/UserDashboard").then(m => ({ default: m.UserDashboard })));
const BranchPage = lazy(() => import("./pages/BranchPage").then(m => ({ default: m.BranchPage })));
const RoomPage = lazy(() => import("./pages/rooms/RoomPage"));
const RoomDetailPage = lazy(() => import("./pages/branches/RoomDetailPage").then(m => ({ default: m.RoomDetailPage })));
const HallDetailPage = lazy(() => import("./pages/branches/HallDetailPage").then(m => ({ default: m.HallDetailPage })));
const PublicRoomsPage = lazy(() => import("./pages/RoomsPage"));
const CorporateHallsPage = lazy(() => import("./pages/CorporateHallsPage"));
const CorporateHallDetailPage = lazy(() => import("./pages/CorporateHallDetailPage").then(m => ({ default: m.CorporateHallDetailPage })));
const AndroidPage = lazy(() => import("./pages/AndroidPage"));
const AndroidGalleryPage = lazy(() => import("./pages/AndroidGalleryPage").then(m => ({ default: m.AndroidGalleryPage })));
const IOSGalleryPage = lazy(() => import("./pages/IOSGalleryPage").then(m => ({ default: m.IOSGalleryPage })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const FirebaseTest = lazy(() => import("./pages/FirebaseTest"));


// Lazy load admin components
const BookingsPage = lazy(() => import("@/pages/admin/BookingsPage"));
const AdminRoomsPage = lazy(() => import("@/pages/admin/RoomsPage"));
const ClientsPage = lazy(() => import("@/pages/admin/ClientsPage"));
const MarketingPage = lazy(() => import("@/pages/admin/MarketingPage"));
const PaymentsPage = lazy(() => import("@/pages/admin/PaymentsPage"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const FeedbackPage = lazy(() => import("@/pages/admin/FeedbackPage"));
const BranchesPage = lazy(() => import("@/pages/admin/BranchesPage"));
const SettingsPage = lazy(() => import("@/pages/admin/settings/SettingsPage"));
const DashboardHome = lazy(() => import("@/pages/admin/DashboardHome"));
const AdsPage = lazy(() => import("@/pages/admin/AdsPageNew"));
const SundayBrunchPage = lazy(() => import("@/pages/admin/SundayBrunchPage"));

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

const App = () => {
  return (
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
                <AdProvider>
                  <ConditionalChatbot />
                  <Suspense fallback={<LoadingFallback />}>
                  <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/firebase-test" element={<FirebaseTest />} />
            <Route path="/book" element={<BookPage />} />
            {/* Alias to prevent 404s from legacy links */}
            <Route path="/booking" element={<Navigate to="/book" replace />} />
            <Route path="/android" element={<AndroidPage />} />
            <Route path="/android/gallery/:branchId" element={<AndroidGalleryPage />} />
            <Route path="/branch/:branchId" element={<BranchPage />} />
            <Route path="/branches/:branchId" element={<BranchPage />} />
            <Route path="/branch/:branchId/room/:roomId" element={<RoomDetailPage />} />
            <Route path="/branch/:branchId/hall/:hallId" element={<HallDetailPage />} />
            <Route path="/rooms" element={<PublicRoomsPage />} />
            <Route path="/rooms/:id" element={<RoomPage />} />
            <Route path="/corporate-halls" element={<CorporateHallsPage />} />
            <Route path="/corporate-halls/:hallId" element={<CorporateHallDetailPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />

            {/* User Dashboard - Only accessible to non-admin users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="user" redirectTo="/admin">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/new-booking" element={<Navigate to="/book" replace />} />
            {/* Admin Routes - Only accessible to admin users with branch selection */}
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
              <Route path="feedback" element={
                <Suspense fallback={<LoadingFallback />}>
                  <FeedbackPage />
                </Suspense>
              } />
              <Route path="branches" element={
                <Suspense fallback={<LoadingFallback />}>
                  <BranchesPage />
                </Suspense>
              } />
              <Route path="ads" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdsPage />
                </Suspense>
              } />
              <Route path="sunday-brunch" element={
                <Suspense fallback={<LoadingFallback />}>
                  <SundayBrunchPage />
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
              </Suspense>
                </AdProvider>
              </DatabaseProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
