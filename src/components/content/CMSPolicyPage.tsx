import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { Truck, RotateCcw, ShieldCheck, HelpCircle, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';

export const CMSPolicyPage: React.FC = () => {
  const { viewParams, publicSettings, addToast } = useStorefront();
  const pageType = viewParams.cmsPageType || 'shipping';

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast({ title: 'Message Sent!', description: 'Our support team will respond within 2 hours.', type: 'success' });
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        
        {pageType === 'shipping' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <Truck size={28} />
              <h1 className="text-2xl font-black text-slate-900">Shipping & Delivery Policy</h1>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All orders placed before 2:00 PM PST are processed and dispatched on the same business day.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="font-bold text-slate-900">Standard Express Shipping</div>
                <div className="text-slate-500 mt-1">2-3 Business Days • FREE on orders over ${publicSettings?.freeShippingThreshold || 99} ($12 flat rate under $99).</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="font-bold text-slate-900">Priority Overnight Air</div>
                <div className="text-slate-500 mt-1">1 Business Day • $18.00 • Guaranteed morning delivery with live GPS carrier tracking.</div>
              </div>
            </div>
          </div>
        )}

        {pageType === 'returns' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <RotateCcw size={28} />
              <h1 className="text-2xl font-black text-slate-900">30-Day Money Back Guarantee</h1>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We stand behind our electronics. If you are not 100% satisfied with your hardware, return it within 30 days for a full refund with no restocking fees.
            </p>
          </div>
        )}

        {pageType === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <HelpCircle size={28} />
              <h1 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h1>
            </div>

            <div className="space-y-4 divide-y divide-slate-100 text-xs">
              {[
                { q: 'Are all products backed by official manufacturer warranty?', a: 'Yes! Every item includes 2 Years of Official AuraCare Warranty covering hardware defects, battery health, and components.' },
                { q: 'Can I connect headphones to multiple devices simultaneously?', a: 'Yes, Aura Studio Pro ANC Headphones support Bluetooth 5.4 Multipoint for seamless laptop & phone switching.' },
                { q: 'Is the 100W GaN charger compatible with MacBook Pro?', a: 'Yes, the USB-C PD 3.1 port delivers full 100W power required for 16-inch MacBook Pro laptops.' },
              ].map((faq, i) => (
                <div key={i} className="pt-3 space-y-1">
                  <div className="font-bold text-slate-900">{faq.q}</div>
                  <div className="text-slate-500 leading-relaxed">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pageType === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <Mail size={28} />
              <h1 className="text-2xl font-black text-slate-900">Contact Hardware Support</h1>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">Name</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Message / Query</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-rose-600 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Send size={16} />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
