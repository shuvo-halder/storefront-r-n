'use client';

import React, { useState, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { navigateTo } = useStorefront();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storefrontApi.getFAQs().then(data => {
      setFaqs(data);
      setIsLoading(false);
    });
  }, []);

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <HelpCircle size={14} className="text-primary" />
            <span>Support Center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            How can we <span className="text-primary">help you?</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Search our knowledge base for answers to common questions about Vyzobd hardware, shipping, and warranty.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search questions (e.g. 'warranty', 'shipping')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[32px] shadow-2xl shadow-slate-200/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-900"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-12">
          {categories.map(category => {
            const categoryFaqs = filteredFaqs.filter(f => f.category === category);
            if (categoryFaqs.length === 0) return null;

            return (
              <div key={category} className="space-y-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] ml-2">{category}</h2>
                <div className="space-y-4">
                  {categoryFaqs.map((faq) => (
                    <div 
                      key={faq.id}
                      className={`bg-white border transition-all duration-300 rounded-[24px] overflow-hidden ${
                        expandedId === faq.id ? 'border-primary/20 shadow-xl shadow-primary/5' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                        className="w-full px-8 py-6 flex items-center justify-between text-left group"
                      >
                        <span className={`font-bold text-slate-900 transition-colors ${expandedId === faq.id ? 'text-primary' : 'group-hover:text-primary'}`}>
                          {faq.question}
                        </span>
                        <div className={`p-2 rounded-xl transition-all ${expandedId === faq.id ? 'bg-primary/5 text-primary' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                          {expandedId === faq.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>
                      
                      <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          expandedId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-8 pb-8 pt-0 text-slate-500 font-medium leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-20 space-y-4 bg-white border border-slate-100 rounded-[48px]">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Search size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-900 font-black">No results found</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Try different keywords or browse categories</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Support */}
        <div className="bg-slate-900 rounded-[48px] p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-slate-900/20">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-primary/30">
            <MessageCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Still have questions?</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">Our support engineers are available 24/7 to help with any technical or order issues.</p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => navigateTo('cms-page', { cmsPageType: 'contact-us' })}
              className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all transform hover:scale-105"
            >
              Contact Support Team
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
