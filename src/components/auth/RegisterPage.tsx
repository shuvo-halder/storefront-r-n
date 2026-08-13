'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Mail, Lock, User, Phone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError: setErrorField,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerAccount(data);
      router.push('/account');
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.field) {
            setErrorField(e.field as any, { type: 'server', message: e.message });
          }
        });
      }
      setError(err?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-bold hover:text-primary-hover transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 sm:rounded-[40px] border border-slate-100 mx-4 sm:mx-0">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    {...register('fullName')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="Full Name"
                  />
                </div>
                {errors.fullName && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    {...register('phone')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="+8801..."
                  />
                </div>
                {errors.phone && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  {...register('agreeTerms')}
                  id="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded-lg"
                />
              </div>
              <div className="ml-3 text-xs">
                <label htmlFor="agree-terms" className="font-bold text-slate-700">
                  I agree to the <Link href="/pages/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/pages/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
                {errors.agreeTerms && <p className="mt-1 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.agreeTerms.message}</p>}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-[11px] font-bold text-primary flex items-center gap-3">
                <ShieldCheck size={18} className="rotate-180" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              <span>{isSubmitting ? 'Creating Account...' : 'Get Started Now'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

