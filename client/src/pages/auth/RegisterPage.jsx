import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, Home, Building, Key, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    role: z.enum(['tenant', 'owner']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'tenant',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setSubmitting(true);
    const res = await registerAuth(data);
    setSubmitting(false);

    if (res.success && res.user) {
      if (res.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
              <Home className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              House<span className="text-teal-600">Hunt</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Create Your Account</h2>
          <p className="mt-1 text-xs text-slate-500">
            Join the house rental platform connecting tenants and property owners
          </p>
        </div>

        {/* Role Selector Card */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">I am joining as a:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue('role', 'tenant')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedRole === 'tenant'
                  ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Key className={`w-5 h-5 mb-2 ${selectedRole === 'tenant' ? 'text-teal-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold text-slate-900">Tenant / Renter</p>
                <p className="text-[10px] text-slate-500">Find & book homes</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setValue('role', 'owner')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedRole === 'owner'
                  ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Building className={`w-5 h-5 mb-2 ${selectedRole === 'owner' ? 'text-teal-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold text-slate-900">Property Owner</p>
                <p className="text-[10px] text-slate-500">List & rent properties</p>
              </div>
            </button>
          </div>
        </div>

        {/* Notice for Owner role */}
        {selectedRole === 'owner' && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Note:</strong> Landlord applications undergo administrator review before publishing listings.
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name *"
            icon={User}
            placeholder="e.g. Budi Santoso"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address *"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone Number"
            type="tel"
            icon={Phone}
            placeholder="08123456789"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Password *"
            type="password"
            icon={Lock}
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm Password *"
            type="password"
            icon={Lock}
            placeholder="Repeat password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full font-bold shadow-md shadow-teal-600/20"
            loading={submitting}
          >
            Create {selectedRole === 'owner' ? 'Owner' : 'Tenant'} Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
