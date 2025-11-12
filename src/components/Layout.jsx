import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SidebarLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ' +
        (active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100')
      }
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 border-r border-gray-200 bg-white p-4 md:flex md:flex-col">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/" className="text-xl font-extrabold tracking-tight">
              NewsAdmin
            </Link>
          </div>
          <nav className="space-y-1">
            <SidebarLink to="/" active={isActive('/')}>
              Нүүр
            </SidebarLink>
            <SidebarLink to="/news" active={isActive('/news')}>
              Мэдээнүүд
            </SidebarLink>
            <SidebarLink to="/categories" active={isActive('/categories')}>
              Ангилал
            </SidebarLink>
            <SidebarLink to="/users" active={isActive('/users')}>
              Хэрэглэгчид / Эрх
            </SidebarLink>
            <SidebarLink to="/banners" active={isActive('/banners')}>
               Banner удирдлага
            </SidebarLink>
          </nav>
          <div className="mt-auto">
            {user ? (
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">role: {user.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
                >
                  Гарах
                </button>
              </div>
            ) : (
              <Link className="text-sm" to="/login">
                Нэвтрэх
              </Link>
            )}
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <Link to="/" className="text-lg font-bold">
              NewsAdmin
            </Link>
            <Link to="/menu" className="rounded-md bg-gray-100 px-3 py-1.5 text-sm">
              Цэс
            </Link>
          </div>
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
