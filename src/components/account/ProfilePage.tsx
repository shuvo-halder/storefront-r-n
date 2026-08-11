import React, { useState } from 'react';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Camera, ShieldCheck, Loader2, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
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
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AccountLayout activeTab="profile">
      <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage your account details and preferences.</p>
          </div>
          <div className="hidden sm:block">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
               <ShieldCheck className="text-primary" size={16} />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Secure</span>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-100">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
              <button 
                type="button"
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl border-2 border-white flex items-center justify-center shadow-lg hover:bg-primary transition-all group-hover:scale-110 active:scale-95"
              >
                <Camera size={18} />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight">Profile Photo</h3>
              <p className="text-[11px] text-slate-400 font-medium max-w-[200px]">
                Recommended size: 512x512px. PNG, JPG or WEBP formats supported.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  {...register('fullName', { required: 'Name is required' })}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  {...register('email')}
                  disabled
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">Email cannot be changed online</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  {...register('phone')}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
             <div className="flex items-center gap-3">
               {isSuccess && (
                 <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in zoom-in duration-300">
                   <ShieldCheck size={18} />
                   <span className="text-xs font-bold">Profile updated successfully!</span>
                 </div>
               )}
             </div>
             <button
               type="submit"
               disabled={isSubmitting}
               className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary disabled:bg-slate-300 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
             >
               {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
               <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
             </button>
          </div>

        </form>
      </div>
    </AccountLayout>
  );
};
