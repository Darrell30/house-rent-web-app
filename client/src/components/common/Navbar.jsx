import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Heart,
  Calendar,
  PlusCircle,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationDropdown } from './NotificationDropdown';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { user, isAuthenticated, isTenant, isOwner, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isOwner) return '/owner/dashboard';
    return '/tenant/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                House<span className="text-teal-600">Hunt</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/properties"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/properties')
                    ? 'text-teal-600 bg-teal-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Browse Properties
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to={getDashboardPath()}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname.includes('/dashboard')
                        ? 'text-teal-600 bg-teal-50/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>

                  {isTenant && (
                    <>
                      <Link
                        to="/tenant/bookings"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/tenant/bookings')
                            ? 'text-teal-600 bg-teal-50/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/tenant/saved"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/tenant/saved')
                            ? 'text-teal-600 bg-teal-50/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Saved
                      </Link>
                    </>
                  )}

                  {isOwner && (
                    <>
                      <Link
                        to="/owner/properties"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/owner/properties')
                            ? 'text-teal-600 bg-teal-50/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        My Properties
                      </Link>
                      <Link
                        to="/owner/bookings"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/owner/bookings')
                            ? 'text-teal-600 bg-teal-50/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Requests
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/users"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/admin/users')
                            ? 'text-teal-600 bg-teal-50/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Users
                      </Link>
                      <Link
                        to="/admin/approvals"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/admin/approvals')
                            ? 'text-teal-600 bg-teal-50/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Owner Approvals
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {isOwner && (
                  <Link to="/owner/properties/add">
                    <Button size="sm" icon={PlusCircle} variant="outline">
                      List Property
                    </Button>
                  </Link>
                )}

                <NotificationDropdown />

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center overflow-hidden border border-teal-200">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 divide-y divide-slate-100 border border-slate-100">
                      <div className="p-3">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-teal-50 text-teal-700">
                          {user?.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <Link
                          to={
                            isAdmin
                              ? '/admin/profile'
                              : isOwner
                              ? '/owner/profile'
                              : '/tenant/profile'
                          }
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <User className="w-4 h-4 mr-2.5 text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2.5 text-slate-400" />
                          Dashboard
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4 mr-2.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Properties
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              {isTenant && (
                <>
                  <Link
                    to="/tenant/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/tenant/saved"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Saved Properties
                  </Link>
                </>
              )}
              {isOwner && (
                <>
                  <Link
                    to="/owner/properties"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Properties
                  </Link>
                  <Link
                    to="/owner/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Booking Requests
                  </Link>
                  <Link
                    to="/owner/properties/add"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-teal-600 hover:bg-teal-50"
                  >
                    + Add New Property
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    User Management
                  </Link>
                  <Link
                    to="/admin/approvals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Owner Approvals
                  </Link>
                  <Link
                    to="/admin/properties"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Property Management
                  </Link>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Register Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
