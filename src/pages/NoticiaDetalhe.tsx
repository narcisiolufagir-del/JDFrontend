import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { newsAPI, formatNewsDate, getCategoryColor } from "@/services/news";
import type { NewsArticle } from "@/types/news";
import { cn } from "@/lib/utils";

const NoticiaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    newsAPI
      .getPost(Number(id))
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a56db]" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">Notícia não encontrada.</p>
        <button onClick={() => navigate(-1)} className="text-[#1a56db] font-medium">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="font-bold text-[#1a56db] text-sm">O DESTAQUE</span>
      </header>

      {article.image_url && (
        <div className="w-full h-56">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="px-4 py-5 max-w-2xl mx-auto">
        {article.category && (
          <span
            className={cn(
              "inline-block px-2.5 py-1 rounded-md text-xs font-semibold text-white mb-3",
              getCategoryColor(article.category.slug)
            )}
          >
            {article.category.name}
          </span>
        )}

        <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">
          {article.title}
        </h1>

        <p className="text-sm text-gray-400 mb-5">
          {formatNewsDate(article.date)}
        </p>

        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed
            [&_p]:mb-4 [&_strong]:font-semibold [&_a]:text-[#1a56db]"
          dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
        />

        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-6 text-sm text-[#1a56db] font-medium"
        >
          Ver no site <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </article>
    </div>
  );
};

export default NoticiaDetalhe;
