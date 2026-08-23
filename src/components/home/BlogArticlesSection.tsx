'use client';
import React from 'react';
import { SmartImage } from '../common/SmartImage';
import { useQuery } from '@tanstack/react-query';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { ArrowRight, BookOpen, Clock, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const BlogArticlesSection: React.FC = () => {
  const { navigateTo } = useStorefront();

  const { data: articles = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['blog_articles_section'],
    queryFn: storefrontApi.getArticles
  });

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <BookOpen size={14} />
              Journal & Stories
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Latest Articles & Guides
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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <Skeleton className="w-full aspect-video rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 bg-slate-50 border border-rose-200 rounded-2xl text-center space-y-3 max-w-md mx-auto">
            <AlertCircle size={24} className="text-rose-500 mx-auto" />
            <p className="text-xs text-slate-600">Failed to load articles: {(error as Error)?.message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && articles.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
            No journal articles currently published.
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && !isError && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((article) => (
              <article
                key={article.id}
                onClick={() => navigateTo('article-detail', { articleSlug: article.slug })}
                className="group bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-video bg-slate-200 overflow-hidden relative">
                  <SmartImage 
                    src={article.coverImage} 
                    alt={article.title} 
                    fill
                    fallbackType="blog"
                    fallbackLabel={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {article.category && (
                    <span className="absolute top-3 left-3 bg-slate-900/90 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full backdrop-blur-xs">
                      {article.category}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                      {article.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {article.date}
                        </span>
                      )}
                      {article.readTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {article.readTime}
                          </span>
                        </>
                      )}
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
        )}

      </div>
    </section>
  );
};
