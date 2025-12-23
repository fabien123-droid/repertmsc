import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SongPage from "./pages/SongPage";
import NotFound from "./pages/NotFound";
import AdminAuthPage from "./pages/AdminAuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import SongsManagement from "./pages/admin/SongsManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import AdminsManagement from "./pages/admin/AdminsManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/song/:id" element={<SongPage />} />
          
          {/* Admin Routes - Completely Separate */}
          <Route path="/admin" element={<AdminAuthPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="songs" element={<SongsManagement />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="admins" element={<AdminsManagement />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
