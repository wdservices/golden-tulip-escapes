import { lazy, Suspense } from 'react';
import { createBrowserRouter } from "react-router-dom";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { DashboardHome } from "@/pages/admin/DashboardHome";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AdminTestPage } from "@/pages/admin/AdminTestPage";

// Lazy load admin components for better performance
const BookingsPage = lazy(() => import("@/pages/admin/BookingsPage"));
const RoomsPage = lazy(() => import("@/pages/admin/RoomsPage"));
const ClientsPage = lazy(() => import("@/pages/admin/ClientsPage"));
const MarketingPage = lazy(() => import("@/pages/admin/MarketingPage"));
const PaymentsPage = lazy(() => import("@/pages/admin/PaymentsPage"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const BranchesPage = lazy(() => import("@/pages/admin/BranchesPage"));
const SettingsPage = lazy(() => import("@/pages/admin/settings/SettingsPage"));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size={48} />
  </div>
);

export const adminRouter = createBrowserRouter([
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: "bookings",
        element: <Suspense fallback={<LoadingFallback />}><BookingsPage /></Suspense>,
      },
      {
        path: "rooms",
        element: <Suspense fallback={<LoadingFallback />}><RoomsPage /></Suspense>,
      },
      {
        path: "clients",
        element: <Suspense fallback={<LoadingFallback />}><ClientsPage /></Suspense>,
      },
      {
        path: "marketing",
        element: <Suspense fallback={<LoadingFallback />}><MarketingPage /></Suspense>,
      },
      {
        path: "payments",
        element: <Suspense fallback={<LoadingFallback />}><PaymentsPage /></Suspense>,
      },
      {
        path: "reports",
        element: <Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense>,
      },
      {
        path: "branches",
        element: <Suspense fallback={<LoadingFallback />}><BranchesPage /></Suspense>,
      },
      {
        path: "settings",
        element: <Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense>,
      },
      {
        path: "test",
        element: <AdminTestPage />,
      },
    ],
  },
]);
