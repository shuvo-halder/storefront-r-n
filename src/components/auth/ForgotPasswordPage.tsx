'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { ShieldAlert, ArrowLeft, Smartphone, Mail, Headphones } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const { navigateTo, publicSettings } = useStorefront();

  const supportEmail = publicSettings?.supportEmail || publicSettings?.general?.storeEmail || publicSettings?.store?.supportEmail;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 mb-4 border border-amber-200">
          <ShieldAlert size={24} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">Account Access & Recovery</h1>
        <p className="mt-1.5 text-xs text-[#6B7280]">
          Secure self-service access options for your Vyzobd account
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs rounded-xl border border-[#E5E7EB] space-y-6">
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
            <h2 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span>Instant Access via Mobile OTP</span>
            </h2>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              If you have registered your Bangladesh mobile number with your account, you can sign in immediately using a 6-digit one-time SMS verification code without requiring your password.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#DC2B53] hover:bg-[#C52247] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Smartphone size={16} />
              <span>Sign In with Mobile OTP</span>
            </button>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#111827] text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Mail size={16} />
              <span>Sign In with Email & Password</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
            <div className="flex items-start gap-2 text-xs text-[#6B7280]">
              <Headphones size={16} className="text-[#6B7280] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#111827] block">Need Help Recovering Your Account?</span>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Contact customer support {supportEmail ? <>at <span className="font-semibold text-[#111827]">{supportEmail}</span></> : null} or via live support for identity verification and account restoration.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="w-full flex items-center justify-center gap-1.5 pt-2 text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

