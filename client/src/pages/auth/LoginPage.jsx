import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Home, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const res = await login(data);
    setSubmitting(false);

    if (res.success && res.user) {
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.user.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/tenant/dashboard', { replace: true });
      }
    }
  };

  const fillDemoAccount = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-lg">
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
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to access your properties, bookings, and inquiries
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pill Bar (Ideal for SkillWallet Capstone Review) */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-center space-y-2">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] font-bold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Quick Fill Demonstration Credentials:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@househunt.id', 'Password123!')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors shadow-xs"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('budi.santoso@househunt.id', 'Password123!')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors shadow-xs"
            >
              Owner (Approved)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('dewi.lestari@househunt.id', 'Password123!')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors shadow-xs"
            >
              Owner (Pending)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('andi.wijaya@househunt.id', 'Password123!')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors shadow-xs"
            >
              Tenant
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full font-bold shadow-md shadow-teal-600/20"
            loading={submitting}
          >
            Sign In
          </Button>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
