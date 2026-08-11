import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { MOCK_BLOG_ARTICLES } from '../../data/mockProducts';
import { ArrowRight, BookOpen, Clock, Calendar } from 'lucide-react';

export const BlogArticlesSection: React.FC = () => {
  const { navigateTo } = useStorefront();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <BookOpen size={14} />
              Aura Tech Journal
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hardware Reviews & Setup Guides
            </h2>
          </div>

          <button
            onClick={() => navigateTo('blog')}
            className="text-xs font-bold text-slate-700 hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Read All Articles</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_BLOG_ARTICLES.map((article) => (
            <article
              key={article.id}
              onClick={() => navigateTo('article-detail', { articleSlug: article.slug })}
              className="group bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-video bg-slate-200 overflow-hidden relative">
                <img 
                  src={article.coverImage} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 left-3 bg-slate-900/90 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {article.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {article.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {article.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Read Article</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
