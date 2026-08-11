import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { MOCK_BLOG_ARTICLES } from '../../data/mockProducts';
import { Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { navigateTo } = useStorefront();

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider">
            <BookOpen size={14} />
            Tech & Hardware Journal
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Latest Industry Insights & Reviews
          </h1>
          <p className="text-xs text-slate-500">
            Deep-dive articles on spatial acoustic engineering, GaN IV thermal efficiency, and minimal desk setups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_BLOG_ARTICLES.map((art) => (
            <article
              key={art.id}
              onClick={() => navigateTo('article-detail', { articleSlug: art.slug })}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-rose-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-video bg-slate-100 overflow-hidden">
                <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    {art.category}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">{art.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{art.excerpt}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{art.author}</span>
                  <span className="font-bold text-rose-600 flex items-center gap-1">Read →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};
