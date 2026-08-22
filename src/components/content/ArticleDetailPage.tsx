'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SmartImage } from '../common/SmartImage';
import { useParams } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { BlogArticle } from '../../types/storefront';
import { Calendar, Clock, User, ArrowLeft, Share2, ChevronRight, AlertCircle, BookOpen } from 'lucide-react';
import { SEO } from '../common/SEO';
import { RichTextRenderer } from '../common/RichTextRenderer';

export const ArticleDetailPage: React.FC = () => {
  const routeParams = useParams();
  const { viewParams, addToast } = useStorefront();
  const slug = (routeParams?.slug as string) || viewParams.articleSlug;

  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setError('Article slug is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const art = await storefrontApi.getArticleBySlug(slug);
        if (!art) {
          setError(`Article '${slug}' was not found.`);
          setArticle(null);
        } else {
          setArticle(art);
          
          if (art.relatedArticleSlugs && art.relatedArticleSlugs.length > 0) {
            const related = await Promise.all(
              art.relatedArticleSlugs.map(s => storefrontApi.getArticleBySlug(s))
            );
            setRelatedArticles(related.filter((r): r is BlogArticle => r !== null));
          }
        }
      } catch (err: any) {
        console.error('Error fetching article detail:', err);
        setError(err?.message || 'Failed to fetch article details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        title: 'Link Copied',
        description: 'Article URL copied to clipboard.',
        type: 'success',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 space-y-3 p-6">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Article...
        </p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Article Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          {error || 'The requested article could not be located or has been archived.'}
        </p>
        <Link
          href="/blog"
          className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:bg-primary-hover transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Return to Journal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEO 
        title={article.title}
        description={article.excerpt}
        ogImage={article.coverImage}
        ogType="article"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <article className="bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200/50">
          
          <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden bg-slate-100">
            <SmartImage 
              src={article.coverImage} 
              alt={article.title} 
              fill
              fallbackType="blog"
              fallbackLabel={article.title}
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            <div className="absolute top-8 left-8">
              <Link
                href="/blog"
                className="px-6 py-2.5 bg-white/90 backdrop-blur-md text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
              >
                <ArrowLeft size={16} />
                <span>Journal</span>
              </Link>
            </div>
          </div>

          <div className="p-8 sm:p-12 lg:p-20 space-y-10">
            <div className="space-y-6 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3">
                 <span className="px-4 py-1.5 bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest rounded-full">
                  {article.category}
                </span>
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} />
                  {article.readTime}
                </span>
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
                <button 
                  onClick={handleShare}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-primary rounded-full transition-colors cursor-pointer"
                  title="Share Article"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <RichTextRenderer content={article.content} />
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="pt-10 border-t border-slate-50 flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest rounded-xl">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">More from the Journal</h3>
              <Link 
                href="/blog"
                className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2"
              >
                <span>View All Articles</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="p-6 bg-white border border-slate-100 rounded-3xl flex gap-6 hover:shadow-xl transition-all group block"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden relative shrink-0 bg-slate-100">
                    <SmartImage
                      src={rel.coverImage}
                      alt={rel.title}
                      fill
                      fallbackType="blog"
                      fallbackLabel={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-2">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{rel.category}</span>
                    <h4 className="font-black text-sm text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">{rel.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{rel.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
