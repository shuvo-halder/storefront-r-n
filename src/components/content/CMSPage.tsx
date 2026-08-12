'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { CMSPage as CMSPageType } from '../../types/storefront';
import { Mail, Send, Calendar, ArrowLeft } from 'lucide-react';

import { SEO } from '../common/SEO';

export const CMSPage: React.FC = () => {
  const routeParams = useParams();
  const { viewParams, navigateTo, addToast } = useStorefront();
  const slug = (routeParams?.slug as string) || viewParams.cmsPageType || 'about-us';
  
  const [page, setPage] = useState<CMSPageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    storefrontApi.getCMSPageBySlug(slug).then(data => {
      setPage(data);
      setIsLoading(false);
    });
  }, [slug]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addToast({ 
      title: 'Message Sent!', 
      description: 'Our support team will respond within 2 hours.', 
      type: 'success' 
    });
    setContactForm({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
        <button onClick={() => navigateTo('home')} className="text-primary font-bold hover:underline">Return to Home</button>
      </div>
    );
  }

  const isContactPage = slug === 'contact-us' || slug === 'contact';

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <SEO 
        title={page.title}
        description={page.content.substring(0, 160)}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="p-8 sm:p-12 lg:p-20 space-y-10">
            
            <div className="space-y-6">
              <button
                onClick={() => window.history.back()}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Go Back</span>
              </button>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {page.title}
                </h1>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Calendar size={14} />
                  <span>Last Updated: {new Date(page.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <div className="text-slate-600 text-base sm:text-lg leading-relaxed space-y-6 font-medium whitespace-pre-line">
                {page.content}
              </div>
            </div>

            {isContactPage && (
              <div className="pt-10 border-t border-slate-100 mt-10">
                <div className="bg-slate-50 rounded-[32px] p-8 sm:p-12 space-y-8">
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Direct Support Line</h2>
                    <p className="text-sm text-slate-500 font-medium">Have a technical hardware question? Send us a message.</p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Message</label>
                      <textarea
                        rows={5}
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="How can we help?"
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            <span className="uppercase tracking-widest text-sm">Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
