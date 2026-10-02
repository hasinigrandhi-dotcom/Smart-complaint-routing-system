import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

type AppUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN' | string;
};

type AuthState = {
  token: string | null;
  user: AppUser | null;
};

function readAuthState(): AuthState {
  const token = localStorage.getItem('scrs_token');
  const storedUser = localStorage.getItem('scrs_user');

  try {
    return {
      token,
      user: storedUser ? JSON.parse(storedUser) : null
    };
  } catch {
    return {
      token,
      user: null
    };
  }
}

function useAuthState() {
  const [auth, setAuth] = useState<AuthState>(() => readAuthState());

  useEffect(() => {
    const syncAuth = () => setAuth(readAuthState());
    window.addEventListener('storage', syncAuth);
    window.addEventListener('scrs-auth-change', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('scrs-auth-change', syncAuth);
    };
  }, []);

  return auth;
}

function triggerAuthChange() {
  window.dispatchEvent(new Event('scrs-auth-change'));
}

function ProtectedCitizenRoute() {
  const { token } = useAuthState();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function ProtectedAdminRoute() {
  const { token, user } = useAuthState();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function AppShell() {
  const navigate = useNavigate();
  const { token, user } = useAuthState();
  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';
  const isCitizen = user?.role === 'USER' || (!isAdmin && isAuthenticated);

  const handleLogout = () => {
    localStorage.removeItem('scrs_token');
    localStorage.removeItem('scrs_user');
    triggerAuthChange();
    navigate('/login');
  };

  const publicLinks = useMemo(
    () => (
      <>
        <Link to="/">Home</Link>
      </>
    ),
    []
  );

  const citizenLinks = useMemo(
    () => (
      <>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/dashboard">Dashboard</Link>
        {' | '}
        <button type="button" onClick={handleLogout} className="nav-logout-btn">Logout</button>
      </>
    ),
    [handleLogout]
  );

  const adminLinks = useMemo(
    () => (
      <>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/admin">Admin Dashboard</Link>
        {' | '}
        <button type="button" onClick={handleLogout} className="nav-logout-btn">Logout</button>
      </>
    ),
    [handleLogout]
  );

  return (
    <>
      <header className="app-header">
        <h1>Smart Complaint Routing System</h1>
        <nav>
          {!isAuthenticated && publicLinks}
          {isAuthenticated && isCitizen && !isAdmin && citizenLinks}
          {isAuthenticated && isAdmin && adminLinks}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedCitizenRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/submit-complaint" element={<SubmitComplaintPage />} />
            <Route path="/my-complaints" element={<MyComplaintsPage />} />
          </Route>

          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
