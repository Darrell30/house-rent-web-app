import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/public/LandingPage';
import { BrowsePropertiesPage } from './pages/public/BrowsePropertiesPage';
import { PropertyDetailsPage } from './pages/public/PropertyDetailsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/common/ProfilePage';
import { MessagesPage } from './pages/shared/MessagesPage';
import { TenantDashboardPage } from './pages/tenant/TenantDashboardPage';
import { MyBookingsPage } from './pages/tenant/MyBookingsPage';
import { SavedPropertiesPage } from './pages/tenant/SavedPropertiesPage';
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';
import { MyPropertiesPage } from './pages/owner/MyPropertiesPage';
import { AddPropertyPage } from './pages/owner/AddPropertyPage';
import { EditPropertyPage } from './pages/owner/EditPropertyPage';
import { OwnerBookingsPage } from './pages/owner/OwnerBookingsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import OwnerApprovalsPage from './pages/admin/OwnerApprovalsPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="properties" element={<BrowsePropertiesPage />} />
        <Route path="properties/:id" element={<PropertyDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['tenant']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="tenant" element={<Navigate to="/tenant/dashboard" replace />} />
        <Route path="tenant/dashboard" element={<TenantDashboardPage />} />
        <Route path="tenant/bookings" element={<MyBookingsPage />} />
        <Route path="tenant/saved" element={<SavedPropertiesPage />} />
        <Route path="tenant/profile" element={<ProfilePage />} />
        <Route path="tenant/messages" element={<MessagesPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['owner']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="owner" element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="owner/dashboard" element={<OwnerDashboardPage />} />
        <Route path="owner/properties" element={<MyPropertiesPage />} />
        <Route path="owner/properties/add" element={<AddPropertyPage />} />
        <Route path="owner/properties/:id/edit" element={<EditPropertyPage />} />
        <Route path="owner/bookings" element={<OwnerBookingsPage />} />
        <Route path="owner/profile" element={<ProfilePage />} />
        <Route path="owner/messages" element={<MessagesPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="admin/users" element={<UserManagementPage />} />
        <Route path="admin/approvals" element={<OwnerApprovalsPage />} />
        <Route path="admin/properties" element={<AdminPropertiesPage />} />
        <Route path="admin/bookings" element={<AdminBookingsPage />} />
        <Route path="admin/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
