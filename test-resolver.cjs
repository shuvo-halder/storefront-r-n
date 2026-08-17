const { z } = require('zod');
const { zodResolver } = require('@hookform/resolvers/zod');

const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Full name is required (min 3 chars)'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

const billingAddressSchema = shippingAddressSchema.extend({
  sameAsShipping: z.boolean(),
});

const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().min(10),
  }),
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema,
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'sslcommerz', 'stripe']),
});

const resolver = zodResolver(checkoutSchema);

const values = {
  customer: {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890'
  },
  shippingAddress: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    addressLine1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States'
  },
  billingAddress: {
    sameAsShipping: true,
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    addressLine1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States'
  },
  shippingMethod: 'standard',
  paymentMethod: 'stripe'
};

async function test() {
  const result = await resolver(values, undefined, {
    fields: {
      'shippingAddress': { name: 'shippingAddress' },
      'billingAddress': { name: 'billingAddress' },
    }
  });
  console.log("Resolver Result:", JSON.stringify(result, null, 2));
}

test();
