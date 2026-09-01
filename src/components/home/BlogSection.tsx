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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Skeleton className="h-5 w-32 mb-4 bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
              <Skeleton className="h-36 w-full rounded-lg bg-slate-200" />
              <Skeleton className="h-3.5 w-1/3 rounded-md bg-slate-200" />
              <Skeleton className="h-5 w-full rounded-md bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-[#DC2B53] font-semibold text-xs uppercase tracking-wider mb-0.5">
            <BookOpen size={14} />
            <span>Articles & Insights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            Latest Stories & Guides
          </h2>
        </div>

        <button
          onClick={() => navigateTo('blog')}
          className="text-xs font-semibold text-[#DC2B53] hover:text-[#C52247] flex items-center gap-1 transition-colors cursor-pointer self-end sm:self-auto min-h-[32px]"
        >
          <span>Read All Articles</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {articles.map((article) => (
          <article
            key={article.id}
            onClick={() => navigateTo('article-detail', { articleSlug: article.slug })}
            className="group bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="h-40 sm:h-44 overflow-hidden bg-[#F9FAFB] relative">
                <SmartImage 
                  src={article.coverImage} 
                  alt={article.title} 
                  fill
                  fallbackType="blog"
                  fallbackLabel={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#111827]/90 text-white font-medium text-[10px] backdrop-blur-xs">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <div className="flex items-center gap-2.5 text-[11px] text-[#6B7280]">
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

                <h3 className="font-semibold text-sm sm:text-base text-[#111827] group-hover:text-[#DC2B53] transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </div>

            <div className="p-4 pt-1 flex items-center gap-1 text-xs font-semibold text-[#DC2B53] group-hover:translate-x-1 transition-transform">
              <span>Read Article</span>
              <ArrowRight size={13} />
            </div>
          </article>
        ))}
      </div>

    </section>
  );
};
