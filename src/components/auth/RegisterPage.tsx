'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  registerSchema, 
  RegisterFormData,
  mobileRegisterRequestSchema,
  MobileRegisterRequestFormData,
  mobileRegisterVerifySchema,
  MobileRegisterVerifyFormData
} from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  KeyRound, 
  RotateCw, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatBDPhoneE164 } from '../../utils/phone';

function getSafeRedirectUrl(rawRedirect: string | null): string {
  if (!rawRedirect) return '/account';
  const decoded = decodeURIComponent(rawRedirect).trim();
  if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('://')) {
    return decoded;
  }
  return '/account';
}

export const RegisterPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerAccount, registerWithMobile, verifyMobileRegister, isAuthenticated } = useAuth();
  const { notifySuccess, notifyError } = useStorefront();

  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Mobile OTP registration state
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [mobilePhone, setMobilePhone] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState<boolean>(false);

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
  // Email & Password Registration Hook
  // ----------------------------------------------------
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    setError: setErrorEmail,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onEmailSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerAccount({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      notifySuccess('Account Created!', 'Your account has been registered successfully.');
      router.push(redirectTarget);
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.field) {
            setErrorEmail(e.field as any, { type: 'server', message: e.message });
          }
        });
      }
      const msg = err?.message || 'Registration failed. Please check your information and try again.';
      setServerError(msg);
      notifyError(err, 'Registration Failed', msg);
    }
  };

  // ----------------------------------------------------
  // Mobile OTP Registration Hooks
  // ----------------------------------------------------
  const {
    register: registerMobileReq,
    handleSubmit: handleSubmitMobileReq,
    setError: setErrorMobileReq,
    formState: { errors: mobileReqErrors },
  } = useForm<MobileRegisterRequestFormData>({
    resolver: zodResolver(mobileRegisterRequestSchema),
  });

  const {
    register: registerMobileVerify,
    handleSubmit: handleSubmitMobileVerify,
    setValue: setMobileVerifyValue,
    setError: setErrorMobileVerify,
    formState: { errors: mobileVerifyErrors },
  } = useForm<MobileRegisterVerifyFormData>({
    resolver: zodResolver(mobileRegisterVerifySchema),
  });

  const onMobileRequestSubmit = async (data: MobileRegisterRequestFormData) => {
    setServerError(null);
    setIsSubmittingOtp(true);
    try {
      const formatted = formatBDPhoneE164(data.phone);
      await registerWithMobile(formatted);
      setMobilePhone(formatted);
      setMobileVerifyValue('phone', formatted);
      setOtpStep('verify');
      setResendCooldown(60);
      notifySuccess('Code Sent', `A 6-digit verification code was sent to ${formatted}`);
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.field) {
            setErrorMobileReq(e.field as any, { type: 'server', message: e.message });
          }
        });
      }
      const msg = err?.message || 'Failed to send verification SMS to mobile number.';
      setServerError(msg);
      notifyError(err, 'Verification Code Error', msg);
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const onMobileVerifySubmit = async (data: MobileRegisterVerifyFormData) => {
    setServerError(null);
    setIsSubmittingOtp(true);
    try {
      const formatted = formatBDPhoneE164(data.phone || mobilePhone);
      await verifyMobileRegister({
        phone: formatted,
        code: data.code.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        password: data.password ? data.password : undefined,
      });

      notifySuccess('Registration Verified!', 'Welcome to Vyzobd.');
      router.push(redirectTarget);
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.field) {
            setErrorMobileVerify(e.field as any, { type: 'server', message: e.message });
          }
        });
      }
      const msg = err?.message || 'Invalid or expired verification code.';
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
      await registerWithMobile(mobilePhone);
      setResendCooldown(60);
      notifySuccess('Code Resent', `A fresh code has been sent to ${mobilePhone}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend verification code.';
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
        <h1 className="text-2xl font-bold text-[#111827]">Create an Account</h1>
        <p className="mt-1 text-xs text-[#6B7280]">
          Already have an account?{' '}
          <Link
            href={`/login${redirectTarget !== '/account' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="text-[#DC2B53] font-semibold hover:text-[#C52247] transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs rounded-xl border border-[#E5E7EB]">
          
          {/* Registration Method Switcher - Mobile OTP registration is temporarily disabled until backend SMS integration is available */}
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
          {/* METHOD 1: STANDARD EMAIL REGISTRATION */}
          {/* ==================================================== */}
          {authMethod === 'email' && (
            <form className="space-y-4" onSubmit={handleSubmitEmail(onEmailSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <User size={16} />
                    </div>
                    <input
                      {...registerEmail('firstName')}
                      type="text"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                      placeholder="Jane"
                    />
                  </div>
                  {emailErrors.firstName && (
                    <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{emailErrors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <User size={16} />
                    </div>
                    <input
                      {...registerEmail('lastName')}
                      type="text"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                      placeholder="Doe"
                    />
                  </div>
                  {emailErrors.lastName && (
                    <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{emailErrors.lastName.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <Mail size={16} />
                    </div>
                    <input
                      {...registerEmail('email')}
                      type="email"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                      placeholder="jane.doe@example.com"
                    />
                  </div>
                  {emailErrors.email && (
                    <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{emailErrors.email.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Bangladesh Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <Phone size={16} />
                    </div>
                    <input
                      {...registerEmail('phone')}
                      type="tel"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                  {emailErrors.phone && (
                    <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{emailErrors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <Lock size={16} />
                    </div>
                    <input
                      {...registerEmail('password')}
                      type={showPassword ? 'text' : 'password'}
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

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <Lock size={16} />
                    </div>
                    <input
                      {...registerEmail('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="block w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {emailErrors.confirmPassword && (
                    <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{emailErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start pt-2">
                <div className="flex items-center h-5">
                  <input
                    {...registerEmail('agreeTerms')}
                    id="agree-terms"
                    type="checkbox"
                    className="h-4 w-4 text-[#DC2B53] focus:ring-[#DC2B53] border-[#E5E7EB] rounded accent-[#DC2B53]"
                  />
                </div>
                <div className="ml-2.5 text-xs">
                  <label htmlFor="agree-terms" className="font-medium text-[#6B7280]">
                    I agree to the <Link href="/pages/terms" className="text-[#DC2B53] hover:underline font-semibold">Terms of Service</Link> and <Link href="/pages/privacy" className="text-[#DC2B53] hover:underline font-semibold">Privacy Policy</Link>
                  </label>
                  {emailErrors.agreeTerms && (
                    <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{emailErrors.agreeTerms.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingEmail}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs mt-2"
              >
                {isSubmittingEmail ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                <span>{isSubmittingEmail ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>
          )}

          {/* ==================================================== */}
          {/* METHOD 2: MOBILE OTP REGISTRATION */}
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
                        className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                        placeholder="017XXXXXXXX"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#6B7280]">
                      We will send a 6-digit verification code to this mobile number.
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
                    <span>{isSubmittingOtp ? 'Sending SMS Code...' : 'Send Verification Code'}</span>
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">First Name</label>
                      <input
                        {...registerMobileVerify('firstName')}
                        type="text"
                        className="block w-full px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                        placeholder="Jane"
                      />
                      {mobileVerifyErrors.firstName && (
                        <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                          {mobileVerifyErrors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Last Name</label>
                      <input
                        {...registerMobileVerify('lastName')}
                        type="text"
                        className="block w-full px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                        placeholder="Doe"
                      />
                      {mobileVerifyErrors.lastName && (
                        <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                          {mobileVerifyErrors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Password <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      {...registerMobileVerify('password')}
                      type="password"
                      className="block w-full px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                      placeholder="Set password (optional)"
                    />
                    {mobileVerifyErrors.password && (
                      <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                        {mobileVerifyErrors.password.message}
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
                    <span>{isSubmittingOtp ? 'Verifying...' : 'Complete Registration'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
            <p className="text-[11px] text-center text-[#6B7280]">
              By registering, you agree to Vyzobd's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
