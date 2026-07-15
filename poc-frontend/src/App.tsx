import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeModeProvider, useThemeMode, ThemeMode } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import FluxListPage from './pages/FluxListPage';
import FluxFormPage from './pages/FluxFormPage';
import ExecutionsPage from './pages/ExecutionsPage';
import ExecutionDetailPage from './pages/ExecutionDetailPage';
import StatsPage from './pages/StatsPage';

const getTheme = (mode: ThemeMode) => createTheme({
  palette: {
    mode,
    primary: { main: mode === 'light' ? '#1F4E79' : '#90CAF9' },
    secondary: { main: mode === 'light' ? '#2E75B6' : '#64B5F6' },
    background: mode === 'light'
      ? { default: '#F5F7FA', paper: '#FFFFFF' }
      : { default: '#0A1929', paper: '#132F4C' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06)',
    '0 2px 6px rgba(0,0,0,0.07)',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 3px 10px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.09)',
    '0 4px 14px rgba(0,0,0,0.09)',
    '0 5px 16px rgba(0,0,0,0.10)',
    '0 6px 18px rgba(0,0,0,0.10)',
    '0 7px 20px rgba(0,0,0,0.11)',
    '0 8px 22px rgba(0,0,0,0.11)',
    '0 9px 24px rgba(0,0,0,0.12)',
    '0 10px 26px rgba(0,0,0,0.12)',
    '0 11px 28px rgba(0,0,0,0.12)',
    '0 12px 30px rgba(0,0,0,0.13)',
    '0 13px 32px rgba(0,0,0,0.13)',
    '0 14px 34px rgba(0,0,0,0.13)',
    '0 15px 36px rgba(0,0,0,0.14)',
    '0 16px 38px rgba(0,0,0,0.14)',
    '0 17px 40px rgba(0,0,0,0.14)',
    '0 18px 42px rgba(0,0,0,0.15)',
    '0 19px 44px rgba(0,0,0,0.15)',
    '0 20px 46px rgba(0,0,0,0.15)',
    '0 21px 48px rgba(0,0,0,0.16)',
    '0 22px 50px rgba(0,0,0,0.16)',
  ],
  typography: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    body2: { fontSize: '0.875rem' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
  },
});

const LoginRoute: React.FC = () => {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return <LoginPage />;
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/flux" element={<FluxListPage />} />

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/flux/new" element={<FluxFormPage />} />
              <Route path="/flux/:id/edit" element={<FluxFormPage />} />
            </Route>

            <Route path="/executions" element={<ExecutionsPage />} />
            <Route path="/executions/:id" element={<ExecutionDetailPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const ThemedApp: React.FC = () => {
  const { mode } = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: '14px' },
              success: { iconTheme: { primary: '#28a745', secondary: '#fff' } },
              error: { iconTheme: { primary: '#dc3545', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <ThemeModeProvider>
    <ThemedApp />
  </ThemeModeProvider>
);

export default App;
