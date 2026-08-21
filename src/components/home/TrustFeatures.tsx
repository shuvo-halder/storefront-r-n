'use client';
import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, Lock } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: <Headphones size={16} className="text-[#DC2B53]" />,
      title: '24/7 Support',
      description: 'Dedicated customer help',
    },
    {
      icon: <Truck size={16} className="text-[#DC2B53]" />,
      title: 'Fast Delivery',
      description: 'Express shipping options',
    },
    {
      icon: <ShieldCheck size={16} className="text-[#DC2B53]" />,
      title: 'Authentic Products',
      description: '100% verified authentic',
    },
    {
      icon: <RotateCcw size={16} className="text-[#DC2B53]" />,
      title: 'Easy Returns',
      description: '30-day money back',
    },
    {
      icon: <Lock size={16} className="text-[#DC2B53]" />,
      title: 'Secure Payment',
      description: 'Fully encrypted checkout',
    },
  ];

  // Repeat feature items 4 times to guarantee a seamless infinite marquee on all screen sizes
  const marqueeItems = [...features, ...features, ...features, ...features];

  return (
    <section 
      aria-label="Store Benefits and Guarantees" 
      className="bg-white border-y border-[#E5E7EB] py-2.5 sm:py-3 overflow-hidden w-full relative select-none"
    >
      {/* Edge gradient fade masks for smooth ticker appearance */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

      <div className="trust-marquee-container w-full overflow-hidden">
        <div className="animate-trust-marquee flex items-center">
          {marqueeItems.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2.5 px-5 sm:px-8 py-0.5 shrink-0"
            >
              <div className="w-7 h-7 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div className="flex flex-col justify-center min-w-0 text-left whitespace-nowrap">
                <span className="text-xs font-semibold text-[#111827] leading-snug">
                  {feature.title}
                </span>
                <span className="text-[11px] text-[#6B7280] font-normal leading-tight">
                  {feature.description}
                </span>
              </div>
              <span className="ml-5 sm:ml-8 text-gray-200 font-light select-none text-xs" aria-hidden="true">
                |
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


