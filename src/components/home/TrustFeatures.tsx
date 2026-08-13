'use client';
import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { Truck, ShieldCheck, RotateCcw, Headphones, Lock, Award } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const { publicSettings } = useStorefront();

  const features = [
    {
      icon: <Headphones size={24} className="text-accent" />,
      title: '24/7 Support',
      description: 'Dedicated expert help',
    },
    {
      icon: <Truck size={24} className="text-accent" />,
      title: 'Fast Delivery',
      description: 'Express shipping options',
    },
    {
      icon: <ShieldCheck size={24} className="text-accent" />,
      title: 'Authentic Products',
      description: '100% verified hardware',
    },
    {
      icon: <RotateCcw size={24} className="text-accent" />,
      title: 'Easy Returns',
      description: '30-day money back',
    },
    {
      icon: <Lock size={24} className="text-accent" />,
      title: 'Secure Payment',
      description: 'Fully encrypted checkout',
    },
  ];

  return (
    <section className="bg-white border-y border-border-default py-10">
      <div className="container-vyzobd">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:divide-x divide-border-default">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex items-center lg:justify-center gap-4 px-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center flex-shrink-0">
                {feature.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">
                  {feature.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
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
