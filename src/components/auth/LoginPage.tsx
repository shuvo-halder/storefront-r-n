'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  loginSchema, 
  LoginFormData, 
  mobileLoginRequestSchema, 
  MobileLoginRequestFormData,
  mobileLoginVerifySchema,
  MobileLoginVerifyFormData 
} from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  Loader2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Smartphone, 
  KeyRound,
  RotateCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { formatBDPhoneE164, normalizeBDPhone } from '../../utils/phone';

/**
 * Validates redirect query to prevent open-redirect vulnerabilities
 */
function getSafeRedirectUrl(rawRedirect: string | null): string {
  if (!rawRedirect) return '/account';
  const decoded = decodeURIComponent(rawRedirect).trim();
  if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('://')) {
    return decoded;
  }
  return '/account';
}

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithMobile, verifyMobileLogin, isAuthenticated } = useAuth();
  const { notifySuccess, notifyError } = useStorefront();

  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Mobile OTP state
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [mobilePhone, setMobilePhone] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState<boolean>(false);

  const isSessionExpired = searchParams?.get('session_expired') === 'true';
  const redirectTarget = getSafeRedirectUrl(searchParams?.get('redirect'));

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ----------------------------------------------------
  // Email & Password Form Hook
  // ----------------------------------------------------
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    setError: setErrorEmail,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onEmailSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data);
      notifySuccess('Welcome Back!', 'Signed in successfully.');
      router.push(redirectTarget);
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.field) {
            setErrorEmail(e.field as any, { type: 'server', message: e.message });
          }
        });
      }
      const msg = err?.message || 'Invalid email or password. Please check your credentials.';
      setServerError(msg);
      notifyError(err, 'Sign In Failed', msg);
    }
  };

  // ----------------------------------------------------
  // Mobile OTP Form Hooks
  // ----------------------------------------------------
  const {
    register: registerMobileReq,
    handleSubmit: handleSubmitMobileReq,
    setError: setErrorMobileReq,
    formState: { errors: mobileReqErrors },
  } = useForm<MobileLoginRequestFormData>({
    resolver: zodResolver(mobileLoginRequestSchema),
  });

  const {
    register: registerMobileVerify,
    handleSubmit: handleSubmitMobileVerify,
    setValue: setMobileVerifyValue,
    setError: setErrorMobileVerify,
    formState: { errors: mobileVerifyErrors },
  } = useForm<MobileLoginVerifyFormData>({
    resolver: zodResolver(mobileLoginVerifySchema),
  });

  const onMobileRequestSubmit = async (data: MobileLoginRequestFormData) => {
    setServerError(null);
    setIsSubmittingOtp(true);
    try {
      const formatted = formatBDPhoneE164(data.phone);
      await loginWithMobile(formatted);
      setMobilePhone(formatted);
      setMobileVerifyValue('phone', formatted);
      setOtpStep('verify');
      setResendCooldown(60);
      notifySuccess('Code Sent', `A 6-digit OTP has been sent to ${formatted}`);
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.field) {
            setErrorMobileReq(e.field as any, { type: 'server', message: e.message });
          }
        });
      }
      const msg = err?.message || 'Failed to send OTP code to mobile number.';
      setServerError(msg);
      notifyError(err, 'OTP Request Failed', msg);
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const onMobileVerifySubmit = async (data: MobileLoginVerifyFormData) => {
    setServerError(null);
    setIsSubmittingOtp(true);
    try {
      const formatted = formatBDPhoneE164(data.phone || mobilePhone);
      await verifyMobileLogin({
        phone: formatted,
        code: data.code.trim(),
      });
      notifySuccess('Welcome Back!', 'Signed in successfully via mobile OTP.');
      router.push(redirectTarget);
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.field) {
            setErrorMobileVerify(e.field as any, { type: 'server', message: e.message });
          }
        });
      }
      const msg = err?.message || 'Invalid or expired OTP code. Please try again.';
      setServerError(msg);
      notifyError(err, 'Verification Failed', msg);
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !mobilePhone) return;
    setServerError(null);
    setIsSubmittingOtp(true);
    try {
      await loginWithMobile(mobilePhone);
      setResendCooldown(60);
      notifySuccess('Code Resent', `A fresh OTP code has been sent to ${mobilePhone}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend OTP code.';
      setServerError(msg);
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FDF0F3] mb-4 border border-[#DC2B53]/20">
          <ShieldCheck size={24} className="text-[#DC2B53]" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">Customer Sign In</h1>
        <p className="mt-1 text-xs text-[#6B7280]">
          Don't have an account?{' '}
          <Link
            href={`/register${redirectTarget !== '/account' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="text-[#DC2B53] font-semibold hover:text-[#C52247] transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs rounded-xl border border-[#E5E7EB]">
          
          {/* Session Expired Banner */}
          {isSessionExpired && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
              <AlertCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 font-medium">
                <span className="font-semibold block">Session Expired</span>
                Your security session has expired. Please sign in again to continue.
              </div>
            </div>
          )}

          {/* Authentication Method Tabs - Mobile OTP login is temporarily disabled until backend SMS integration is available */}
          {/*
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F3F4F6] rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setServerError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'email'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Mail size={14} />
              <span>Email & Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('mobile');
                setServerError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'mobile'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Smartphone size={14} />
              <span>Mobile OTP</span>
            </button>
          </div>
          */}

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-[#DC2626] flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: EMAIL & PASSWORD LOGIN */}
          {/* ==================================================== */}
          {authMethod === 'email' && (
            <form className="space-y-4" onSubmit={handleSubmitEmail(onEmailSubmit)}>
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <Mail size={16} />
                  </div>
                  <input
                    {...registerEmail('email')}
                    type="email"
                    autoComplete="email"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                    placeholder="name@example.com"
                  />
                </div>
                {emailErrors.email && (
                  <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{emailErrors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#111827]">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-medium text-[#6B7280] hover:text-[#DC2B53] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <Lock size={16} />
                  </div>
                  <input
                    {...registerEmail('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {emailErrors.password && (
                  <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{emailErrors.password.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  {...registerEmail('rememberMe')}
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#DC2B53] focus:ring-[#DC2B53] border-[#E5E7EB] rounded accent-[#DC2B53]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-[#6B7280]">
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingEmail}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {isSubmittingEmail ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                <span>{isSubmittingEmail ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MOBILE OTP LOGIN */}
          {/* ==================================================== */}
          {authMethod === 'mobile' && (
            <div>
              {otpStep === 'request' ? (
                <form className="space-y-4" onSubmit={handleSubmitMobileReq(onMobileRequestSubmit)}>
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Bangladesh Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                        <Smartphone size={16} />
                      </div>
                      <input
                        {...registerMobileReq('phone')}
                        type="tel"
                        autoComplete="tel"
                        className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#6B7280]">
                      We will send a 6-digit one-time verification code via SMS.
                    </p>
                    {mobileReqErrors.phone && (
                      <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                        {mobileReqErrors.phone.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOtp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    {isSubmittingOtp ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    <span>{isSubmittingOtp ? 'Sending OTP...' : 'Send Verification Code'}</span>
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmitMobileVerify(onMobileVerifySubmit)}>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-[11px] text-[#6B7280] block">Code sent to</span>
                      <span className="text-xs font-bold text-[#111827] truncate block">{mobilePhone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('request');
                        setServerError(null);
                      }}
                      className="text-xs font-semibold text-[#DC2B53] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                        <KeyRound size={16} />
                      </div>
                      <input
                        {...registerMobileVerify('code')}
                        type="text"
                        maxLength={6}
                        autoFocus
                        inputMode="numeric"
                        className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-bold tracking-widest text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53] text-center"
                        placeholder="123456"
                      />
                    </div>
                    {mobileVerifyErrors.code && (
                      <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                        {mobileVerifyErrors.code.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">Didn't receive the code?</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isSubmittingOtp}
                      onClick={handleResendOtp}
                      className="font-semibold text-[#DC2B53] hover:underline disabled:text-[#9CA3AF] disabled:no-underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCw size={12} className={isSubmittingOtp ? 'animate-spin' : ''} />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOtp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    {isSubmittingOtp ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    <span>{isSubmittingOtp ? 'Verifying...' : 'Verify & Sign In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
            <p className="text-[11px] text-center text-[#6B7280]">
              Secure customer authentication powered by Vyzobd
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
