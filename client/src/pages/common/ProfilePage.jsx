import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, Lock, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Confirm new password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  });

export const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onProfileSave = async (data) => {
    setProfileSaving(true);
    await updateProfile(data);
    setProfileSaving(false);
  };

  const onPasswordSave = async (data) => {
    setPasswordSaving(true);
    const res = await changePassword(data);
    setPasswordSaving(false);
    if (res.success) {
      resetPasswordForm();
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Account Profile</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Manage your personal information, contact credentials, and security password
        </p>
      </div>

      {/* Account Info Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 font-extrabold text-xl flex items-center justify-center border-2 border-teal-200">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                {user?.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                Status: {user?.isActive ? 'Active' : 'Deactivated'}
              </span>
              {user?.role === 'owner' && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    user.ownerApprovalStatus === 'approved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : user.ownerApprovalStatus === 'pending'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Owner Approval: {user.ownerApprovalStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
            <Input
              label="Full Name"
              icon={User}
              error={profileErrors.name?.message}
              {...registerProfile('name')}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-100 text-slate-500 rounded-lg border border-slate-200 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Email address cannot be changed directly.
              </p>
            </div>

            <Input
              label="Phone Number"
              type="tel"
              icon={Phone}
              error={profileErrors.phone?.message}
              {...registerProfile('phone')}
            />

            <Button type="submit" size="sm" loading={profileSaving}>
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-teal-600" />
            <span>Change Password</span>
          </h3>

          <form onSubmit={handlePasswordSubmit(onPasswordSave)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.confirmNewPassword?.message}
              {...registerPassword('confirmNewPassword')}
            />

            <Button type="submit" size="sm" variant="outline" loading={passwordSaving}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
