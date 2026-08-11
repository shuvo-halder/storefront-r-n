import React, { useState, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { BlogArticle } from '../../types/storefront';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';

export const ArticleDetailPage: React.FC = () => {
  const { viewParams, navigateTo, addToast } = useStorefront();
  const [article, setArticle] = useState<BlogArticle | null>(null);

  useEffect(() => {
    if (!viewParams.articleSlug) return;
    storefrontApi.getArticleBySlug(viewParams.articleSlug).then(setArticle);
  }, [viewParams.articleSlug]);

  if (!article) return null;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        
        <button
          onClick={() => navigateTo('blog')}
          className="text-xs font-bold text-slate-700 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Articles</span>
        </button>

        <div className="space-y-4">
          <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-full uppercase tracking-wider">
            {article.category}
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium pt-1 border-y border-slate-100 py-3">
            <span className="flex items-center gap-1.5"><User size={14} className="text-rose-600" /> {article.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {article.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {article.readTime}</span>
          </div>
        </div>

        <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden">
          <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="text-slate-700 text-sm leading-relaxed space-y-4 whitespace-pre-line font-serif">
          {article.content}
        </div>

      </article>
    </div>
  );
};
