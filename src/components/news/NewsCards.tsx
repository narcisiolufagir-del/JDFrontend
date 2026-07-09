import type { ReactNode } from "react";
import type { NewsArticle } from "@/types/news";
import { formatNewsDate } from "@/services/news";
import { cn } from "@/lib/utils";

const BRAND = "#2B58C5";

function CategoryLabel({ name }: { name: string }) {
  return <span className="text-[12px] font-semibold text-emerald-600">{name}</span>;
}

function ArticleImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={alt} className={cn("w-full h-full object-cover", className)} />;
  }
  return (
    <div
      className={cn("w-full h-full", className)}
      style={{ background: `linear-gradient(135deg, ${BRAND}33, ${BRAND}11)` }}
    />
  );
}

/** Card vertical para scroll horizontal (Recentes) */
export function RecentNewsCard({
  article,
  onClick,
  className,
}: {
  article: NewsArticle;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-[220px] text-left rounded-[16px] border border-gray-100 bg-white overflow-hidden shadow-sm",
        className
      )}
    >
      <div className="w-full h-[130px] lg:h-[180px] bg-gray-100">
        <ArticleImage src={article.image_url} alt={article.title} />
      </div>
      <div className="p-3 space-y-1.5">
        {article.category && <CategoryLabel name={article.category.name} />}
        <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
      </div>
    </button>
  );
}

/** Card grande em destaque por categoria */
export function FeaturedCategoryCard({
  article,
  onClick,
}: {
  article: NewsArticle;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-[16px] border border-gray-100 bg-white overflow-hidden shadow-sm"
    >
      <div className="w-full h-[200px] lg:h-[260px] bg-gray-100">
        <ArticleImage src={article.image_url} alt={article.title} />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-[16px] font-bold text-gray-900 leading-snug line-clamp-3">
          {article.title}
        </h3>
        <p className="text-[12px] text-gray-400">{formatNewsDate(article.date)}</p>
      </div>
    </button>
  );
}

/** Card horizontal compacto */
export function HorizontalNewsCard({
  article,
  onClick,
  showCategory = true,
}: {
  article: NewsArticle;
  onClick: () => void;
  showCategory?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex gap-3 text-left rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm"
    >
      <div className="w-[88px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        <ArticleImage src={article.image_url} alt={article.title} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        {showCategory && article.category && (
          <CategoryLabel name={article.category.name} />
        )}
        <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="text-[12px] text-gray-400">{formatNewsDate(article.date)}</p>
      </div>
    </button>
  );
}

/** Card horizontal mini (topo da categoria filtrada) */
export function MiniNewsCard({
  article,
  onClick,
}: {
  article: NewsArticle;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex gap-3 text-left rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm"
    >
      <div className="w-[72px] h-[60px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <ArticleImage src={article.image_url} alt={article.title} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">{formatNewsDate(article.date)}</p>
      </div>
    </button>
  );
}

/** Secção com título + lista */
export function NewsSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3">
        <h2 className="text-[17px] font-bold text-gray-900">{title}</h2>
        <p className="text-[13px] text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

/** Lista vertical de cards horizontais */
export function NewsVerticalList({
  articles,
  onArticleClick,
}: {
  articles: NewsArticle[];
  onArticleClick: (article: NewsArticle) => void;
}) {
  return (
    <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-2">
      {articles.map((article) => (
        <HorizontalNewsCard
          key={article.id}
          article={article}
          onClick={() => onArticleClick(article)}
        />
      ))}
    </div>
  );
}

/** Row horizontal de cards verticais (estilo Recentes) */
export function NewsHorizontalRow({
  articles,
  onArticleClick,
}: {
  articles: NewsArticle[];
  onArticleClick: (article: NewsArticle) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible xl:grid-cols-4">
      {articles.map((article) => (
        <RecentNewsCard
          key={article.id}
          article={article}
          onClick={() => onArticleClick(article)}
          className="lg:w-full lg:flex-shrink"
        />
      ))}
    </div>
  );
}

export type CategorySectionLayout = "featured-list" | "row" | "list" | "featured-row";

const DEFAULT_CATEGORY_LAYOUTS: CategorySectionLayout[] = [
  "featured-list",
  "list",
  "featured-row",
  "row",
];

/** Secção de categoria com layout variável */
export function CategoryNewsSection({
  title,
  subtitle,
  articles,
  layout,
  onArticleClick,
}: {
  title: string;
  subtitle: string;
  articles: NewsArticle[];
  layout: CategorySectionLayout;
  onArticleClick: (article: NewsArticle) => void;
}) {
  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <NewsSection title={title} subtitle={subtitle}>
      {layout === "featured-list" && (
        <div className="space-y-3 lg:space-y-4">
          <FeaturedCategoryCard article={featured} onClick={() => onArticleClick(featured)} />
          <NewsVerticalList articles={rest} onArticleClick={onArticleClick} />
        </div>
      )}

      {layout === "list" && (
        <NewsVerticalList articles={articles} onArticleClick={onArticleClick} />
      )}

      {layout === "row" && (
        <NewsHorizontalRow articles={articles} onArticleClick={onArticleClick} />
      )}

      {layout === "featured-row" && (
        <div className="space-y-3 lg:space-y-4">
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
            <FeaturedCategoryCard article={featured} onClick={() => onArticleClick(featured)} />
            {rest.length > 0 && (
              <div className="hidden lg:block">
                <NewsVerticalList articles={rest.slice(0, 2)} onArticleClick={onArticleClick} />
              </div>
            )}
          </div>
          {rest.length > 0 && (
            <div className="lg:hidden">
              <NewsHorizontalRow articles={rest} onArticleClick={onArticleClick} />
            </div>
          )}
          {rest.length > 2 && (
            <div className="hidden lg:block">
              <NewsHorizontalRow articles={rest.slice(2)} onArticleClick={onArticleClick} />
            </div>
          )}
        </div>
      )}
    </NewsSection>
  );
}

export function getCategoryLayout(index: number): CategorySectionLayout {
  return DEFAULT_CATEGORY_LAYOUTS[index % DEFAULT_CATEGORY_LAYOUTS.length];
}
