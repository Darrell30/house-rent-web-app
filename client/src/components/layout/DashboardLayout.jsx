import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Calendar,
  Heart,
  User,
  PlusCircle,
  Building2,
  Users,
  CheckSquare,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Clock,
  ArrowRight,
  Compass,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { Button } from '../ui/Button';

export const DashboardLayout = () => {
  const { user, isTenant, isOwner, isAdmin, isPendingOwner, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Build navigation items based on role
  let navItems = [];
  let roleTitle = 'Tenant Portal';

  if (isTenant) {
    roleTitle = 'Tenant Portal';
    navItems = [
      { name: 'Dashboard', path: '/tenant/dashboard', icon: LayoutDashboard },
      { name: 'My Bookings', path: '/tenant/bookings', icon: Calendar },
      { name: 'Saved Properties', path: '/tenant/saved', icon: Heart },
      { name: 'Messages', path: '/tenant/messages', icon: MessageCircle },
      { name: 'My Profile', path: '/tenant/profile', icon: User },
    ];
  } else if (isOwner) {
    roleTitle = 'Owner Portal';
    navItems = [
      { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
      { name: 'My Properties', path: '/owner/properties', icon: Building2 },
      { name: 'Add Property', path: '/owner/properties/add', icon: PlusCircle },
      { name: 'Booking Requests', path: '/owner/bookings', icon: Calendar },
      { name: 'Messages', path: '/owner/messages', icon: MessageCircle },
      { name: 'My Profile', path: '/owner/profile', icon: User },
    ];
  } else if (isAdmin) {
    roleTitle = 'Admin Portal';
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Owner Approvals', path: '/admin/approvals', icon: CheckSquare },
      { name: 'Properties', path: '/admin/properties', icon: Building2 },
      { name: 'All Bookings', path: '/admin/bookings', icon: Calendar },
      { name: 'My Profile', path: '/admin/profile', icon: User },
    ];
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        } flex flex-col`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white shadow-md">
              <Home className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              House<span className="text-teal-400">Hunt</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Tag */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
            {roleTitle}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <Link
              to="/properties"
              className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Explore Public Marketplace</span>
            </Link>
          </div>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-teal-800 text-teal-200 font-bold text-xs flex items-center justify-center overflow-hidden border border-teal-600/50">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs py-1.5"
            icon={LogOut}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-slate-800 hidden sm:block">
              {roleTitle}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/properties" className="text-xs font-medium text-teal-600 hover:text-teal-700 hidden sm:flex items-center space-x-1">
              <span>View Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <NotificationDropdown />
          </div>
        </header>

        {/* Warning Banner for Pending Owners */}
        {isOwner && isPendingOwner && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6 flex items-center space-x-3 text-amber-800">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Account Verification Pending: </span>
              Your owner account is currently awaiting administrator approval. You will be able to publish listings as soon as an admin approves your profile.
            </div>
          </div>
        )}

        {/* Outlet Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
