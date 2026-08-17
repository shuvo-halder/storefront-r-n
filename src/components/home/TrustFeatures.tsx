'use client';
import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, Lock } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: <Headphones size={20} className="text-[#DC2B53]" />,
      title: '24/7 Support',
      description: 'Dedicated customer help',
    },
    {
      icon: <Truck size={20} className="text-[#DC2B53]" />,
      title: 'Fast Delivery',
      description: 'Express shipping options',
    },
    {
      icon: <ShieldCheck size={20} className="text-[#DC2B53]" />,
      title: 'Authentic Products',
      description: '100% verified authentic',
    },
    {
      icon: <RotateCcw size={20} className="text-[#DC2B53]" />,
      title: 'Easy Returns',
      description: '30-day money back',
    },
    {
      icon: <Lock size={20} className="text-[#DC2B53]" />,
      title: 'Secure Payment',
      description: 'Fully encrypted checkout',
    },
  ];

  return (
    <section className="bg-white border-y border-[#E5E7EB] py-5 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 lg:divide-x divide-[#E5E7EB]">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3 ${idx !== 0 ? 'lg:pl-6' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                {feature.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-semibold text-[#111827] truncate">
                  {feature.title}
                </h4>
                <p className="text-[11px] text-[#6B7280] font-normal truncate">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

