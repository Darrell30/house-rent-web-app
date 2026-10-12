import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check persistent authentication on load
  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success(`Welcome back, ${response.data.user.name}!`);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success(response.message || 'Registration successful!');
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('You have been logged out');
    } catch (error) {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success('Profile updated successfully');
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      return { success: false, message: error.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData);
      toast.success('Password changed successfully');
      return { success: true, message: response.message };
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isTenant: user?.role === 'tenant',
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
    isApprovedOwner: user?.role === 'owner' && user?.ownerApprovalStatus === 'approved',
    isPendingOwner: user?.role === 'owner' && user?.ownerApprovalStatus === 'pending',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
