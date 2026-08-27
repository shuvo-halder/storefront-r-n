'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SmartImage } from '../common/SmartImage';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../context/AuthContext';
import { useStorefront } from '../../context/StorefrontContext';
import { customerService } from '../../services/customerService';
import { uploadService } from '../../services/uploadService';
import { 
  CustomerProfile, 
  updateCustomerProfileSchema, 
  UpdateCustomerProfileFormData,
  UpdateCustomerProfilePayload 
} from '../../types/customer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  X, 
  Save, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Upload,
  Camera
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { customer, user, syncCustomerProfile } = useAuth();
  const activeUser = customer || user;
  const { notifySuccess, notifyError } = useStorefront();
  const queryClient = useQueryClient();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Query /customer/profile with TanStack Query
  const { 
    data: profileData, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['customer', 'profile'],
    queryFn: async () => {
      const res = await customerService.getProfile();
      if (res.status === 'error' || !res.data?.profile) {
        throw new Error(res.message || 'Failed to load customer profile.');
      }
      return res.data.profile;
    },
    staleTime: 60 * 1000,
  });

  // Fallback merged profile from AuthContext if query is settling
  const activeProfile: CustomerProfile = profileData || {
    id: activeUser?.id || '',
    firstName: activeUser?.firstName || '',
    lastName: activeUser?.lastName || '',
    email: activeUser?.email || '',
    phone: activeUser?.phone || '',
    avatarUrl: activeUser?.avatarUrl || activeUser?.avatar || '',
    avatar: activeUser?.avatar || activeUser?.avatarUrl || '',
    emailVerified: activeUser?.emailVerified,
    phoneVerified: activeUser?.phoneVerified,
  };

  // 2. React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateCustomerProfileFormData>({
    resolver: zodResolver(updateCustomerProfileSchema),
    defaultValues: {
      firstName: activeProfile.firstName || '',
      lastName: activeProfile.lastName || '',
      avatarUrl: activeProfile.avatarUrl || activeProfile.avatar || '',
      phone: activeProfile.phone || '',
    },
  });

  const watchedAvatarUrl = watch('avatarUrl');

  // Handle direct file upload for profile avatar
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      notifyError('Invalid File', validation.error || 'Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const uploadedUrl = await uploadService.uploadToCloudinary(file);
      setValue('avatarUrl', uploadedUrl, { shouldDirty: true, shouldValidate: true });
      setAvatarPreviewUrl(uploadedUrl);
      notifySuccess('Image Uploaded', 'Avatar uploaded successfully. Save your changes to apply.');
    } catch (err: any) {
      notifyError('Upload Failed', err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Keep form values in sync when server profile data loads or changes
  useEffect(() => {
    if (profileData) {
      reset({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        avatarUrl: profileData.avatarUrl || profileData.avatar || '',
        phone: profileData.phone || '',
      });
      setAvatarPreviewUrl(profileData.avatarUrl || profileData.avatar || '');
    }
  }, [profileData, reset]);

  // Keep preview in sync with input
  useEffect(() => {
    if (watchedAvatarUrl !== undefined) {
      setAvatarPreviewUrl(watchedAvatarUrl.trim());
    }
  }, [watchedAvatarUrl]);

  // 3. Mutation for PATCH /customer/profile
  const updateMutation = useMutation({
    mutationFn: async (formData: UpdateCustomerProfileFormData) => {
      // Whitelist ONLY allowed fields (Security rule: id, email, security fields omitted)
      const payload: UpdateCustomerProfilePayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };
      if (formData.avatarUrl && formData.avatarUrl.trim() !== '') {
        payload.avatarUrl = formData.avatarUrl.trim();
      } else {
        payload.avatarUrl = '';
      }
      if (formData.phone !== undefined) {
        payload.phone = formData.phone.trim();
      }

      const res = await customerService.updateProfile(payload);
      if (res.status === 'error' || !res.data?.profile) {
        throw new Error(res.message || 'Failed to update profile.');
      }
      return res.data.profile;
    },
    onSuccess: (updatedProfile) => {
      // 1. Update Profile in TanStack query cache
      queryClient.setQueryData(['customer', 'profile'], updatedProfile);
      // 2. Invalidate dashboard so updated name/avatar are reflected
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
      // 3. Synchronize AuthContext customer and user state (header updates immediately without reload)
      syncCustomerProfile(updatedProfile);
      // 4. Exit edit mode and notify
      setIsEditMode(false);
      notifySuccess('Profile Updated', 'Your profile details have been saved successfully.');
    },
    onError: (err: any) => {
      notifyError(err, 'Profile Update Failed', 'Unable to save profile changes. Please try again.');
    },
  });

  const onSubmit = (data: UpdateCustomerProfileFormData) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    if (profileData) {
      reset({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        avatarUrl: profileData.avatarUrl || profileData.avatar || '',
        phone: profileData.phone || '',
      });
      setAvatarPreviewUrl(profileData.avatarUrl || profileData.avatar || '');
    }
    setIsEditMode(false);
  };

  const displayName = [activeProfile.firstName, activeProfile.lastName].filter(Boolean).join(' ') || 
    activeUser?.fullName || 'Customer';

  const currentAvatar = isEditMode ? avatarPreviewUrl : (activeProfile.avatarUrl || activeProfile.avatar);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Not available';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AccountLayout activeTab="profile">
      <div className="space-y-6">
        
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6 animate-pulse">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-100 rounded w-64"></div>
              </div>
              <div className="h-9 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-40"></div>
                <div className="h-4 bg-gray-100 rounded w-56"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          </div>
        ) : isError ? (
          /* Error State */
          <div className="bg-white rounded-xl p-8 border border-red-200 shadow-xs text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Failed to Load Profile</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
              {error instanceof Error ? error.message : 'Unable to retrieve your customer profile at this moment.'}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn-primary inline-flex items-center gap-2 text-xs cursor-pointer"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              <span>{isFetching ? 'Refreshing...' : 'Retry Profile Load'}</span>
            </button>
          </div>
        ) : (
          /* Loaded Profile Screen */
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs">
            
            {/* Header / Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Profile</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Manage your personal details, verification statuses, and avatar image.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isEditMode ? (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white hover:bg-black rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Hidden File Input for Avatar Upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileSelect}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />

              {/* Avatar Summary / Avatar Editor */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-6 bg-gray-50/70 rounded-xl border border-gray-100">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-white shadow-xs relative">
                    {currentAvatar ? (
                      <SmartImage 
                        src={currentAvatar} 
                        alt={displayName} 
                        fill
                        fallbackType="avatar"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}

                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <Loader2 size={22} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 p-2 bg-[#DC2B53] hover:bg-[#b02242] text-white rounded-full shadow-md transition-transform hover:scale-105 cursor-pointer"
                      title="Upload profile photo"
                    >
                      <Camera size={14} />
                    </button>
                  )}
                </div>

                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">{displayName}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                    {/* Email Verification Status */}
                    {activeProfile.emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Email Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[11px] font-semibold">
                        <ShieldAlert size={12} className="text-amber-600" />
                        <span>Email Unverified</span>
                      </span>
                    )}

                    {/* Phone Verification Status */}
                    {activeProfile.phoneVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Phone Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-md text-[11px] font-semibold">
                        <Phone size={12} className="text-gray-500" />
                        <span>Phone Unverified</span>
                      </span>
                    )}
                  </div>

                  {isEditMode && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-[#DC2B53]" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={13} className="text-gray-500" />
                            <span>Upload New Photo</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar URL input (Only visible in Edit Mode) */}
              {isEditMode && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Avatar Image URL (or upload above)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <ImageIcon size={16} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      {...register('avatarUrl')}
                      className={`block w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53] ${
                        errors.avatarUrl ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.avatarUrl && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.avatarUrl.message}</p>
                  )}
                  <p className="text-[11px] text-gray-500">
                    Upload an image file using the button above or paste a direct image URL (PNG, JPG, WEBP).
                  </p>
                </div>
              )}

              {/* Main Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* First Name (Editable) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    First Name {isEditMode && <span className="text-[#DC2B53]">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      disabled={!isEditMode || updateMutation.isPending}
                      {...register('firstName')}
                      className={`block w-full pl-10 pr-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isEditMode 
                          ? 'bg-white border border-gray-200 text-gray-900 focus:outline-hidden focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53]' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900 cursor-not-allowed opacity-90'
                      } ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name (Editable) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Last Name {isEditMode && <span className="text-[#DC2B53]">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      disabled={!isEditMode || updateMutation.isPending}
                      {...register('lastName')}
                      className={`block w-full pl-10 pr-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isEditMode 
                          ? 'bg-white border border-gray-200 text-gray-900 focus:outline-hidden focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53]' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900 cursor-not-allowed opacity-90'
                      } ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.lastName.message}</p>
                  )}
                </div>

                {/* Email (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                      <Lock size={11} /> Read-only
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={activeProfile.email || ''}
                      readOnly
                      disabled
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 font-medium">
                    Primary contact email linked with your account login.
                  </p>
                </div>

                {/* Phone (Editable) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Phone Number {isEditMode && <span className="text-[#DC2B53]">*</span>}
                    </label>
                    {!isEditMode && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                        <Lock size={11} /> Read-only
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="text"
                      disabled={!isEditMode || updateMutation.isPending}
                      {...register('phone')}
                      className={`block w-full pl-10 pr-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isEditMode 
                          ? 'bg-white border border-gray-200 text-gray-900 focus:outline-hidden focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53]' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900 cursor-not-allowed opacity-90'
                      } ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="e.g. 01700000000"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.phone.message}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1 font-medium">
                    Mobile number used for SMS notifications and orders.
                  </p>
                </div>

              </div>

              {/* Security & Account Timestamps (Read-Only) */}
              <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200/80 flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Member Since</div>
                    <div className="text-gray-600 mt-0.5">{formatDate(activeProfile.createdAt)}</div>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200/80 flex items-start gap-3">
                  <Clock size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Last Account Activity</div>
                    <div className="text-gray-600 mt-0.5">{formatDate(activeProfile.lastLoginAt || activeProfile.updatedAt)}</div>
                  </div>
                </div>

              </div>

              {/* Action Buttons (in Edit Mode) */}
              {isEditMode && (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </form>
          </div>
        )}

      </div>
    </AccountLayout>
  );
};
