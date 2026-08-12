'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import { BlogArticle } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { useStorefront } from '../../context/StorefrontContext';
import { BookOpen, ArrowRight, Clock, User } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';

export const BlogSection: React.FC = () => {
  const { navigateTo } = useStorefront();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await storefrontApi.getArticles();
        if (isMounted) setArticles(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch blog articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticles();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-6 w-36 mb-6 bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <Skeleton className="h-40 w-full rounded-xl bg-slate-200" />
              <Skeleton className="h-4 w-1/3 rounded-md bg-slate-200" />
              <Skeleton className="h-6 w-full rounded-md bg-slate-200" />
              <Skeleton className="h-10 w-full rounded-md bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-extrabold text-xs uppercase tracking-wider mb-1">
            <BookOpen size={14} />
            <span>Tech Insights & Deep Dives</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Latest Hardware News
          </h2>
        </div>

        <button
          onClick={() => navigateTo('blog')}
          className="text-xs font-bold text-primary hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Read All Articles</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article
            key={article.id}
            onClick={() => navigateTo('article-detail', { articleSlug: article.slug })}
            className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-rose-300 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden bg-slate-100 relative">
                <SmartImage 
                  src={article.coverImage} 
                  alt={article.title} 
                  fill
                  fallbackType="blog"
                  fallbackLabel={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="primary" size="sm" className="bg-slate-900/90 text-white font-bold backdrop-blur-xs">
                    {article.category}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {article.author}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
              <span>Read Deep Dive</span>
              <ArrowRight size={14} />
            </div>
          </article>
        ))}
      </div>

    </section>
  );
};
