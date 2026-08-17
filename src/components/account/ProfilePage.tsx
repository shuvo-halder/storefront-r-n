'use client';

import React, { useState } from 'react';
import { SmartImage } from '../common/SmartImage';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../context/AuthContext';
import { useStorefront } from '../../context/StorefrontContext';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Camera, ShieldCheck, Loader2, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { notifySuccess, notifyError } = useStorefront();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSuccess(false);
    try {
      await updateProfile(data);
      setIsSuccess(true);
      notifySuccess('Profile Updated', 'Your profile details have been saved successfully.');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      notifyError(error, 'Update Failed', 'Unable to save profile changes. Please try again.');
    }
  };

  return (
    <AccountLayout activeTab="profile">
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Personal Information</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Manage your account details and preferences.</p>
          </div>
          <div className="hidden sm:block">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
               <ShieldCheck className="text-primary" size={14} />
               <span className="text-xs font-semibold text-gray-600">Profile Secure</span>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-xs">
                {user?.avatar ? (
                  <SmartImage 
                    src={user.avatar} 
                    alt={user.fullName || "User avatar"} 
                    fill
                    fallbackType="avatar"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User size={36} className="text-gray-400" />
                )}
              </div>
              <button 
                type="button"
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full border-2 border-white flex items-center justify-center shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
                title="Change Avatar"
              >
                <Camera size={14} />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Profile Photo</h3>
              <p className="text-xs text-gray-500 font-normal max-w-[240px]">
                Recommended size: 512x512px. PNG, JPG or WEBP formats supported.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  {...register('fullName', { required: 'Name is required' })}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  {...register('email')}
                  disabled
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400 font-medium">Email cannot be changed online</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone size={16} />
                </div>
                <input
                  {...register('phone')}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
             <div className="flex items-center gap-3">
               {isSuccess && (
                 <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
                   <ShieldCheck size={16} />
                   <span>Profile updated successfully!</span>
                 </div>
               )}
             </div>
             <button
               type="submit"
               disabled={isSubmitting}
               className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
             </button>
          </div>

        </form>
      </div>
    </AccountLayout>
  );
};
