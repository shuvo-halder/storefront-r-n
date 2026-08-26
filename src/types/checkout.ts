import { z } from 'zod';
import { normalizeBDPhone, isValidBDPhone } from '../utils/phone';

export const bdPhoneSchema = z.string()
  .min(1, 'Phone number is required')
  .transform((val) => normalizeBDPhone(val))
  .refine((val) => isValidBDPhone(val), {
    message: 'Please enter a valid Bangladesh mobile number (e.g. 01712345678 or +8801712345678).',
  });

export const optionalBdPhoneSchema = z.string()
  .transform((val) => normalizeBDPhone(val))
  .refine((val) => !val || isValidBDPhone(val), {
    message: 'Please enter a valid Bangladesh mobile number (e.g. 01712345678 or +8801712345678).',
  })
  .optional()
  .or(z.literal(''));

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Full name is required (min 3 characters)'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required').refine((val) => isValidBDPhone(normalizeBDPhone(val)), {
    message: 'Please enter a valid Bangladesh mobile number (e.g. 01712345678 or +8801712345678).',
  }),
  addressLine1: z.string().min(5, 'Delivery address / Road / Area is required (min 5 characters)'),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(2, 'District / City is required'),
  state: z.string().min(2, 'Thana / Upazila is required'),
  postalCode: z.string().optional().nullable(),
  country: z.string().min(2, 'Country is required'),
});

export const billingAddressSchema = z.object({
  sameAsShipping: z.boolean(),
  fullName: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  addressLine1: z.string().optional().or(z.literal('')),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().nullable(),
  country: z.string(),
});

export const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    firstName: z.string().optional().or(z.literal('')),
    lastName: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
  }),
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema,
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'sslcommerz', 'stripe']),
  couponCode: z.string().optional(),
  orderNotes: z.string().optional(),
  clientId: z.string().optional(),
  sessionId: z.string().optional(),
}).superRefine((data, ctx) => {
  // If billing address is NOT the same as shipping, validate all required billing fields
  if (!data.billingAddress.sameAsShipping) {
    if (!data.billingAddress.fullName || data.billingAddress.fullName.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Billing full name is required (min 3 characters)',
        path: ['billingAddress', 'fullName'],
      });
    }

    const billingPhone = data.billingAddress.phone || '';
    const normalizedBillingPhone = normalizeBDPhone(billingPhone);
    if (!billingPhone.trim() || !isValidBDPhone(normalizedBillingPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid Bangladesh mobile number for billing',
        path: ['billingAddress', 'phone'],
      });
    }

    if (!data.billingAddress.addressLine1 || data.billingAddress.addressLine1.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Billing address / house / road is required (min 5 characters)',
        path: ['billingAddress', 'addressLine1'],
      });
    }

    if (!data.billingAddress.city || data.billingAddress.city.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Billing district / city is required',
        path: ['billingAddress', 'city'],
      });
    }

    if (!data.billingAddress.state || data.billingAddress.state.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Billing thana / upazila is required',
        path: ['billingAddress', 'state'],
      });
    }
  }
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export interface PaymentInitiationResponse {
  orderId: string;
  status: 'pending' | 'success' | 'failed';
  paymentUrl?: string; // Redirect for Stripe/SSLCommerz/bKash/Nagad
  transactionId?: string;
}
