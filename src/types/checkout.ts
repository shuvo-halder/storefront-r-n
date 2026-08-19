import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Full name is required (min 3 chars)'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(2, 'District / City is required'),
  state: z.string().min(2, 'Thana / Upazila / State is required'),
  postalCode: z.string().optional().nullable(),
  country: z.string().min(2, 'Country is required'),
});

export const billingAddressSchema = shippingAddressSchema.extend({
  sameAsShipping: z.boolean(),
});

export const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    firstName: z.string().min(2, 'First name is required').optional(),
    lastName: z.string().min(2, 'Last name is required').optional(),
    phone: z.string().min(10, 'Valid phone is required').optional(),
  }),
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema,
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'sslcommerz', 'stripe']),
  couponCode: z.string().optional(),
  clientId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export interface PaymentInitiationResponse {
  orderId: string;
  status: 'pending' | 'success' | 'failed';
  paymentUrl?: string; // Redirect for Stripe/SSLCommerz/bKash
  transactionId?: string;
}
