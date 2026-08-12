'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import { useParams } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { BlogArticle } from '../../types/storefront';
import { Calendar, Clock, User, ArrowLeft, Share2, ChevronRight } from 'lucide-react';

import { SEO } from '../common/SEO';
import { getArticleSchema, getBreadcrumbSchema } from '../../utils/seo';

export const ArticleDetailPage: React.FC = () => {
  const routeParams = useParams();
  const { viewParams, navigateTo } = useStorefront();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const slug = (routeParams?.slug as string) || viewParams.articleSlug;
    if (!slug) return;
    setIsLoading(true);
    
    const fetchData = async () => {
      const art = await storefrontApi.getArticleBySlug(slug);
      setArticle(art);
      
      if (art?.relatedArticleSlugs) {
        const related = await Promise.all(
          art.relatedArticleSlugs.map(s => storefrontApi.getArticleBySlug(s))
        );
        setRelatedArticles(related.filter((r): r is BlogArticle => r !== null));
      }
      setIsLoading(false);
    };

    fetchData();
  }, [routeParams?.slug, viewParams.articleSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEO 
        title={article.title}
        description={article.excerpt}
        ogImage={article.coverImage}
        ogType="article"
        structuredData={[
          getArticleSchema(article),
          getBreadcrumbSchema([
            { name: 'Home', url: typeof window !== 'undefined' ? window.location.origin : '' },
            { name: 'Journal', url: `${typeof window !== 'undefined' ? window.location.origin : ''}/#blog` },
            { name: article.title, url: typeof window !== 'undefined' ? window.location.href : '' }
          ])
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <article className="bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200/50">
          
          <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden">
            <SmartImage 
              src={article.coverImage} 
              alt={article.title} 
              fill
              fallbackType="blog"
              fallbackLabel={article.title}
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
            <div className="absolute top-8 left-8">
              <button
                onClick={() => navigateTo('blog')}
                className="px-6 py-2.5 bg-white/90 backdrop-blur-md text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
              >
                <ArrowLeft size={16} />
                <span>Journal</span>
              </button>
            </div>
          </div>

          <div className="p-8 sm:p-12 lg:p-20 space-y-10">
            <div className="space-y-6 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3">
                 <span className="px-4 py-1.5 bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest rounded-full">
                  {article.category}
                </span>
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{article.readTime}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center justify-center gap-6 pt-4">
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                    {article.author.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{article.author}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{article.date}</div>
                  </div>
                </div>
                <button className="p-3 bg-slate-50 text-slate-400 hover:text-primary rounded-full transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <div className="text-slate-600 text-base sm:text-lg leading-relaxed space-y-6 font-medium whitespace-pre-line">
                {article.content}
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">More from the Journal</h3>
              <button 
                onClick={() => navigateTo('blog')}
                className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2"
              >
                <span>View All Articles</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map(art => (
                <article
                  key={art.id}
                  onClick={() => navigateTo('article-detail', { articleSlug: art.slug })}
                  className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                    <SmartImage 
                      src={art.coverImage} 
                      alt={art.title} 
                      fill
                      fallbackType="blog"
                      fallbackLabel={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{art.category}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
