import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { BlogArticle } from '../../types/storefront';
import { Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { navigateTo } = useStorefront();
  const [articles, setArticles] = React.useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    storefrontApi.getArticles().then(data => {
      setArticles(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <BookOpen size={14} className="text-primary" />
            <span>Vyzobd Journal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Engineering Insights & <span className="text-primary">Minimalist Culture</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Exploring the intersection of high-performance hardware, sustainable semiconductors, and the future of human-centric workspace design.
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <article 
            onClick={() => navigateTo('article-detail', { articleSlug: featuredArticle.slug })}
            className="group relative bg-white rounded-[48px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50 cursor-pointer transition-all hover:shadow-primary/10/50"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-[16/10] lg:aspect-auto relative overflow-hidden">
                <img 
                  src={featuredArticle.coverImage} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
                    Featured
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} />
                    {featuredArticle.readTime}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
                <div className="pt-6 flex items-center justify-between border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                      {featuredArticle.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{featuredArticle.author}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{featuredArticle.date}</div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center transition-all group-hover:bg-primary group-hover:rotate-12">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularArticles.map((art) => (
            <article
              key={art.id}
              onClick={() => navigateTo('article-detail', { articleSlug: art.slug })}
              className="group bg-white border border-slate-100 rounded-[40px] overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 font-black text-[9px] uppercase tracking-widest rounded-full shadow-sm border border-white/20">
                    {art.category}
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-4 flex-1 flex flex-col">
                <h3 className="font-black text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                  {art.excerpt}
                </p>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-300 text-[10px]">
                      {art.author.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{art.author}</span>
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Read →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};
