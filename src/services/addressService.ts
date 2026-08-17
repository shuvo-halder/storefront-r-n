import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { CustomerAddress, AddressFormData } from '../types/storefront';

export const addressService = {
  // GET /account/addresses
  getAddresses: async (): Promise<ApiResponse<CustomerAddress[]>> => {
    try {
      const res = await apiClient.get('/account/addresses');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'error', message: unwrapped.message || 'Failed to fetch addresses', errors: unwrapped.errors, data: [] };
      }

      const raw = unwrapped.data;
      const list: CustomerAddress[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.addresses)
        ? raw.addresses
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      return { status: 'success', message: null, data: list };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Unable to load addresses');
      return { status: 'error', message, errors, data: [] };
    }
  },

  // POST /account/addresses
  createAddress: async (data: AddressFormData): Promise<ApiResponse<CustomerAddress>> => {
    try {
      const payload = {
        fullName: data.fullName?.trim(),
        phone: data.phone?.trim(),
        ...(data.email ? { email: data.email.trim() } : {}),
        address1: data.address1?.trim(),
        ...(data.address2 ? { address2: data.address2.trim() } : {}),
        city: data.city?.trim(),
        state: data.state?.trim(),
        postalCode: data.postalCode?.trim(),
        country: data.country?.trim() || 'United States',
        isDefault: Boolean(data.isDefault),
        ...(data.label ? { label: data.label.trim() } : {})
      };

      const res = await apiClient.post('/account/addresses', payload);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Unable to save address', errors: unwrapped.errors, data: null as any };
      }

      const address: CustomerAddress = unwrapped.data.address || unwrapped.data;
      return { status: 'success', message: unwrapped.message || 'Address created successfully', data: address };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Unable to save address');
      return { status: 'error', message, errors, data: null as any };
    }
  },

  // PUT /account/addresses/:id
  updateAddress: async (id: string, data: Partial<AddressFormData>): Promise<ApiResponse<CustomerAddress>> => {
    try {
      const payload = {
        ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
        ...(data.phone ? { phone: data.phone.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email?.trim() || '' } : {}),
        ...(data.address1 ? { address1: data.address1.trim() } : {}),
        ...(data.address2 !== undefined ? { address2: data.address2?.trim() || null } : {}),
        ...(data.city ? { city: data.city.trim() } : {}),
        ...(data.state ? { state: data.state.trim() } : {}),
        ...(data.postalCode ? { postalCode: data.postalCode.trim() } : {}),
        ...(data.country ? { country: data.country.trim() } : {}),
        ...(data.isDefault !== undefined ? { isDefault: Boolean(data.isDefault) } : {}),
        ...(data.label !== undefined ? { label: data.label?.trim() || null } : {})
      };

      const res = await apiClient.put(`/account/addresses/${encodeURIComponent(id)}`, payload);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Unable to update address', errors: unwrapped.errors, data: null as any };
      }

      const address: CustomerAddress = unwrapped.data.address || unwrapped.data;
      return { status: 'success', message: unwrapped.message || 'Address updated successfully', data: address };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Unable to update address');
      return { status: 'error', message, errors, data: null as any };
    }
  },

  // DELETE /account/addresses/:id
  deleteAddress: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      const res = await apiClient.delete(`/account/addresses/${encodeURIComponent(id)}`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'error', message: unwrapped.message || 'Unable to delete address', errors: unwrapped.errors, data: false };
      }

      return { status: 'success', message: 'Address deleted successfully', data: true };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Unable to delete address');
      return { status: 'error', message, errors, data: false };
    }
  },

  // Set Address as Default via PUT /account/addresses/:id
  setDefaultAddress: async (id: string, currentAddress: CustomerAddress): Promise<ApiResponse<CustomerAddress>> => {
    try {
      const payload = {
        fullName: currentAddress.fullName,
        phone: currentAddress.phone,
        email: currentAddress.email || '',
        address1: currentAddress.address1,
        address2: currentAddress.address2 || null,
        city: currentAddress.city,
        state: currentAddress.state,
        postalCode: currentAddress.postalCode,
        country: currentAddress.country,
        label: currentAddress.label || null,
        isDefault: true
      };

      const res = await apiClient.put(`/account/addresses/${encodeURIComponent(id)}`, payload);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Unable to set default address', errors: unwrapped.errors, data: null as any };
      }

      const address: CustomerAddress = unwrapped.data.address || unwrapped.data;
      return { status: 'success', message: 'Default address updated', data: address };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Unable to set default address');
      return { status: 'error', message, errors, data: null as any };
    }
  }
};
