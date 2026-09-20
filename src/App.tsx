import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import SiteLoader from "./components/SiteLoader";

const ArticlePage = lazy(() => import("./pages/ArticlePage.tsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.tsx"));
const CategoryPage = lazy(() => import("./pages/CategoryPage.tsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview.tsx"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.tsx"));
const AdminComments = lazy(() => import("./pages/admin/AdminComments.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<SiteLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/articles" element={<AdminArticles />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/comments" element={<AdminComments />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
