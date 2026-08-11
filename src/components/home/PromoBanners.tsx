import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { ArrowRight, Sparkles, Zap, Flame } from 'lucide-react';

export const PromoBanners: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Banner 1 */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white p-8 overflow-hidden shadow-lg flex flex-col justify-between group min-h-[240px]">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-rose-300 text-[10px] font-extrabold uppercase tracking-widest">
              <Flame size={12} className="text-amber-400" />
              WEEKLY AUDIO SPECIAL
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
              Lossless ANC Spatial Headphones
            </h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Get an extra 20% OFF on all flagship over-ear wireless audio with code <span className="font-bold text-amber-300">TECH20</span>.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, categorySlug: 'audio-headphones' }));
                navigateTo('shop');
              }}
              className="py-2.5 px-5 bg-primary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Shop Audio Deals</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Banner 2 */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-8 overflow-hidden shadow-lg flex flex-col justify-between group min-h-[240px]">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-pink-600/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest">
              <Zap size={12} className="text-amber-400" />
              DESK WORKSTATION SETUP
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
              100W GaN IV Fast Chargers & Docks
            </h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Power your entire setup with multi-device magnetic Qi2 pads and Thunderbolt hubs.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, categorySlug: 'mobile-accessories' }));
                navigateTo('shop');
              }}
              className="py-2.5 px-5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Upgrade Desktop</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
