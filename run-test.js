import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost'
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema,
});

function App() {
  const { register, trigger, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        fullName: 'John Doe',
        email: 'test@example.com',
        phone: '1234567890',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
      billingAddress: {
        sameAsShipping: true,
      }
    }
  });

  const sameAsShipping = watch('billingAddress.sameAsShipping');
  const shippingAddress = watch('shippingAddress');

  useEffect(() => {
    if (sameAsShipping && shippingAddress) {
      setValue('billingAddress.fullName', shippingAddress.fullName);
      setValue('billingAddress.email', shippingAddress.email);
      setValue('billingAddress.phone', shippingAddress.phone);
      setValue('billingAddress.addressLine1', shippingAddress.addressLine1);
      setValue('billingAddress.city', shippingAddress.city);
      setValue('billingAddress.state', shippingAddress.state);
      setValue('billingAddress.postalCode', shippingAddress.postalCode);
      setValue('billingAddress.country', shippingAddress.country);
    }
  }, [sameAsShipping, shippingAddress, setValue]);

  return (
    <div>
      <input {...register('billingAddress.sameAsShipping')} type="checkbox" />
      <button id="btn" onClick={async () => {
        const isValid = await trigger(['shippingAddress', 'billingAddress']);
        console.log("IsValid:", isValid);
        console.log("Errors:", JSON.stringify(errors, null, 2));
      }}>Trigger</button>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

setTimeout(() => {
  document.getElementById('btn').click();
}, 500);

