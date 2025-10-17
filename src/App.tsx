import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FlipBook from "./pages/flipbook";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import JornaisManagement from "./pages/admin/JornaisManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import SubscriptionsRequests from "./pages/admin/SubscriptionsRequests";
import Settings from "./pages/admin/Settings";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/jornal/:id" element={<FlipBook />} />
            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute> <Dashboard /> </AdminRoute>} />
            <Route path="/admin/jornais" element={<AdminRoute> <JornaisManagement /> </AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute> <UsersManagement /> </AdminRoute>} />
            <Route path="/admin/subscriptions" element={<AdminRoute> <SubscriptionsRequests /> </AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute> <Settings /> </AdminRoute>} />
            {/* Guard any other /admin/* paths */}
            <Route path="/admin/*" element={<AdminRoute> <NotFound /> </AdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
