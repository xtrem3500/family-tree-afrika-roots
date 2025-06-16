import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/hooks/use-auth';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import Dashboard from '@/pages/Index';
import TreePage from '@/pages/TreePage';
import MembersPage from '@/pages/MembersPage';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { TooltipProvider } from "@/components/ui/tooltip";
import Profile from './pages/Profile';
import { SettingsPage } from './pages/SettingsPage';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant pour gérer les routes protégées
const ProtectedRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route path="/tree" element={<TreePage />} />
      <Route path="/members" element={<MembersPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <ProtectedRoutes />
            <Toaster />
            <Sonner />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
