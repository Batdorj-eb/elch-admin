// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import DashboardHome from './pages/DashboardHome';
import LoginPage from './pages/LoginPage';
import NewsListPage from './pages/NewsListPage';
import NewsEditorPage from './pages/NewsEditorPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersPage from './pages/UsersPage';

function ProtectedShell({ roles }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Ерөнхий хамгаалалттай layout */}
          <Route element={<ProtectedShell />}>
            <Route index element={<DashboardHome />} />
            <Route path="news" element={<NewsListPage />} />
            <Route path="news/new" element={<NewsEditorPage />} />
            <Route path="news/:id/edit" element={<NewsEditorPage />} />
            <Route path="categories" element={<CategoriesPage />} />
          </Route>

          {/* Зөвхөн админ */}
          <Route element={<ProtectedShell roles={['admin']} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
