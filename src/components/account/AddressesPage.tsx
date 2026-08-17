'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AccountLayout } from './AccountLayout';
import { useStorefront } from '../../context/StorefrontContext';
import { useAuth } from '../../context/AuthContext';
import { addressService } from '../../services/addressService';
import { CustomerAddress, AddressFormData } from '../../types/storefront';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Home, 
  Briefcase, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  X, 
  Star, 
  Phone, 
  Mail, 
  Building2, 
  RefreshCw,
  Check
} from 'lucide-react';

export const AddressesPage: React.FC = () => {
  const { addToast } = useStorefront();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deletingAddress, setDeletingAddress] = useState<CustomerAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set Default State
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
    label: 'Home'
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addressService.getAddresses();
      if (res.status === 'success') {
        setAddresses(res.data || []);
      } else {
        setError(res.message || 'Unable to load addresses');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load addresses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingAddress(null);
    setFormError(null);
    setFieldErrors({});
    setFormData({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      isDefault: addresses.length === 0,
      label: 'Home'
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setFormError(null);
    setFieldErrors({});
    setFormData({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      email: addr.email || '',
      address1: addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'United States',
      isDefault: Boolean(addr.isDefault),
      label: addr.label || 'Home'
    });
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormError(null);
    setFieldErrors({});
  };

  // Validate Form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.address1.trim()) {
      errors.address1 = 'Street address is required';
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      errors.state = 'State / Province is required';
    }
    if (!formData.postalCode.trim()) {
      errors.postalCode = 'Postal / ZIP code is required';
    }
    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (editingAddress) {
        // Edit Address
        const res = await addressService.updateAddress(editingAddress.id, formData);
        if (res.status === 'success') {
          addToast({
            title: 'Address Updated',
            description: 'Your address has been updated successfully.',
            type: 'success'
          });
          handleCloseModal();
          fetchAddresses();
        } else {
          setFormError(res.message || 'Unable to save address');
        }
      } else {
        // Create Address
        const res = await addressService.createAddress(formData);
        if (res.status === 'success') {
          addToast({
            title: 'Address Added',
            description: 'Your new address has been saved successfully.',
            type: 'success'
          });
          handleCloseModal();
          fetchAddresses();
        } else {
          setFormError(res.message || 'Unable to save address');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Unable to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set Address as Default
  const handleSetDefault = async (addr: CustomerAddress) => {
    if (addr.isDefault || settingDefaultId) return;

    setSettingDefaultId(addr.id);
    try {
      const res = await addressService.setDefaultAddress(addr.id, addr);
      if (res.status === 'success') {
        addToast({
          title: 'Default Address Updated',
          description: 'Set as your primary delivery address.',
          type: 'success'
        });
        // Optimistically update list or re-fetch
        setAddresses(prev => prev.map(a => ({
          ...a,
          isDefault: a.id === addr.id
        })));
        fetchAddresses();
      } else {
        addToast({
          title: 'Update Failed',
          description: res.message || 'Unable to set default address.',
          type: 'error'
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Update Failed',
        description: err.message || 'Unable to set default address.',
        type: 'error'
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingAddress || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await addressService.deleteAddress(deletingAddress.id);
      if (res.status === 'success') {
        addToast({
          title: 'Address Deleted',
          description: 'The address was permanently removed.',
          type: 'success'
        });
        setAddresses(prev => prev.filter(a => a.id !== deletingAddress.id));
        setDeletingAddress(null);
      } else {
        addToast({
          title: 'Delete Failed',
          description: res.message || 'Unable to delete address.',
          type: 'error'
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        description: err.message || 'Unable to delete address.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AccountLayout activeTab="addresses">
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Saved Addresses</h1>
            <p className="text-[#6B7280] text-xs sm:text-sm font-medium mt-1">Manage your delivery and billing locations for faster checkout.</p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="h-10 px-4 bg-[#DC2B53] hover:bg-[#C52247] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
          >
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-[#E5E7EB] space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-md"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-3/4 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-2/3 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-1/3 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
            <AlertCircle size={32} className="text-[#DC2B53] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#111827]">Unable to load addresses</h3>
              <p className="text-xs text-[#6B7280]">{error}</p>
            </div>
            <button
              onClick={fetchAddresses}
              className="h-9 px-4 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-xs font-semibold text-[#111827] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && addresses.length === 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 text-center space-y-4">
            <div className="w-12 h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full flex items-center justify-center mx-auto text-[#6B7280]">
              <MapPin size={24} className="text-[#DC2B53]" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="text-base font-bold text-[#111827]">No saved addresses yet</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Add your delivery address now to enjoy a smoother and faster checkout experience.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="h-10 px-5 bg-[#DC2B53] hover:bg-[#C52247] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Plus size={16} />
              <span>Add Your First Address</span>
            </button>
          </div>
        )}

        {/* Address Grid */}
        {!isLoading && !error && addresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((addr) => {
              const isDefault = Boolean(addr.isDefault);
              const isSettingThisDefault = settingDefaultId === addr.id;

              return (
                <div 
                  key={addr.id} 
                  className={`
                    bg-white rounded-xl p-5 border shadow-2xs transition-all relative flex flex-col justify-between
                    ${isDefault 
                      ? 'border-[#DC2B53] ring-1 ring-[#DC2B53]/20 bg-rose-50/10' 
                      : 'border-[#E5E7EB] hover:border-gray-300'}
                  `}
                >
                  {/* Top Header Row */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDefault ? 'bg-[#DC2B53] text-white' : 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]'}`}>
                          {addr.label?.toLowerCase() === 'work' || addr.label?.toLowerCase() === 'office' ? (
                            <Briefcase size={15} />
                          ) : (
                            <Home size={15} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#111827]">
                              {addr.label || 'Saved Address'}
                            </span>
                            {isDefault && (
                              <span className="px-2 py-0.5 rounded bg-[#DC2B53]/10 text-[#DC2B53] font-semibold text-[10px] inline-flex items-center gap-1">
                                <Check size={11} />
                                <span>Default</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenEditModal(addr)}
                          title="Edit Address"
                          className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 size={14}/>
                        </button>
                        <button 
                          onClick={() => setDeletingAddress(addr)}
                          title="Delete Address"
                          className="p-1.5 text-[#6B7280] hover:text-[#DC2B53] hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>

                    {/* Address Content */}
                    <div className="space-y-1.5 text-xs text-[#6B7280]">
                      <div className="text-sm font-semibold text-[#111827] truncate">
                        {addr.fullName}
                      </div>

                      <div className="leading-relaxed">
                        <p>{addr.address1}</p>
                        {addr.address2 && <p>{addr.address2}</p>}
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="font-medium text-[#111827]">{addr.country}</p>
                      </div>

                      <div className="pt-2 flex flex-col gap-1 text-[11px] font-medium text-[#6B7280]">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-[#DC2B53] shrink-0" />
                          <span>{addr.phone}</span>
                        </div>
                        {addr.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-[#DC2B53] shrink-0" />
                            <span className="truncate">{addr.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Set Default Footer Action */}
                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                    {isDefault ? (
                      <span className="text-[11px] font-semibold text-[#DC2B53] inline-flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Primary Delivery Address</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addr)}
                        disabled={isSettingThisDefault}
                        className="text-xs font-semibold text-[#6B7280] hover:text-[#DC2B53] transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSettingThisDefault ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-[#DC2B53]" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Star size={13} />
                            <span>Set as Default</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {editingAddress ? 'Update your saved delivery address' : 'Save a new delivery address for checkout'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2B53] font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Label Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1.5">Address Label</label>
                <div className="flex items-center gap-2">
                  {['Home', 'Office', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setFormData({ ...formData, label: lbl })}
                      className={`
                        px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex-1
                        ${formData.label === lbl 
                          ? 'bg-[#DC2B53] text-white border-[#DC2B53]' 
                          : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50'}
                      `}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Full Name <span className="text-[#DC2B53]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53] ${fieldErrors.fullName ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                  />
                  {fieldErrors.fullName && <p className="text-[#DC2B53] text-[11px] mt-1 font-medium">{fieldErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Phone Number <span className="text-[#DC2B53]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53] ${fieldErrors.phone ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                  />
                  {fieldErrors.phone && <p className="text-[#DC2B53] text-[11px] mt-1 font-medium">{fieldErrors.phone}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Email Address <span className="text-[#6B7280] font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Street Address <span className="text-[#DC2B53]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  placeholder="123 Main St"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53] ${fieldErrors.address1 ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                />
                {fieldErrors.address1 && <p className="text-[#DC2B53] text-[11px] mt-1 font-medium">{fieldErrors.address1}</p>}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Apartment, Suite, Unit <span className="text-[#6B7280] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.address2 || ''}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  placeholder="Apt 4B"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    City <span className="text-[#DC2B53]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53] ${fieldErrors.city ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                  />
                  {fieldErrors.city && <p className="text-[#DC2B53] text-[11px] mt-1 font-medium">{fieldErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    State / Province <span className="text-[#DC2B53]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53] ${fieldErrors.state ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                  />
                  {fieldErrors.state && <p className="text-[#DC2B53] text-[11px] mt-1 font-medium">{fieldErrors.state}</p>}
                </div>
              </div>

              {/* Postal Code & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Postal / ZIP Code <span className="text-[#DC2B53]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="10001"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53] ${fieldErrors.postalCode ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                  />
                  {fieldErrors.postalCode && <p className="text-[#DC2B53] text-[11px] mt-1 font-medium">{fieldErrors.postalCode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Country <span className="text-[#DC2B53]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53] ${fieldErrors.country ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                  />
                  {fieldErrors.country && <p className="text-[#DC2B53] text-[11px] mt-1 font-medium">{fieldErrors.country}</p>}
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-[#DC2B53] border-[#E5E7EB] rounded focus:ring-[#DC2B53]"
                  />
                  <span className="text-xs font-medium text-[#111827]">Set as my primary delivery address</span>
                </label>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="h-10 px-4 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-xs font-semibold text-[#111827] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 bg-[#DC2B53] hover:bg-[#C52247] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving Address...</span>
                    </>
                  ) : (
                    <span>{editingAddress ? 'Save Changes' : 'Save Address'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#E5E7EB] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-[#DC2B53]">
              <Trash2 size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#111827]">Delete Saved Address?</h3>
              <p className="text-xs text-[#6B7280]">
                Are you sure you want to delete <span className="font-semibold text-[#111827]">{deletingAddress.fullName}</span>'s address? This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setDeletingAddress(null)}
                disabled={isDeleting}
                className="flex-1 h-10 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-xs font-semibold text-[#111827] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Address</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </AccountLayout>
  );
};

