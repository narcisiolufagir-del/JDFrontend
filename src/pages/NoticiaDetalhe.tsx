import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Heart,
  Calendar,
  User,
} from "lucide-react";
import { newsAPI, formatNewsDate } from "@/services/news";
import type { NewsArticle } from "@/types/news";
import { NewsDetailSkeleton } from "@/components/news/NewsSkeletons";
import { AiNewsFab } from "@/components/news/AiNewsFab";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BRAND = "#2B58C5";

const NoticiaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    newsAPI
      .getPost(Number(id))
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!article) return;
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: article.link || window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(article.link);
        toast({ title: "Link copiado!" });
      }
    } catch {
      // user cancelled
    }
  };

  const handleSave = () => {
    setSaved((s) => !s);
    toast({
      title: saved ? "Removido dos favoritos" : "Guardado nos favoritos",
      description: saved ? undefined : "Funcionalidade completa em breve.",
    });
  };

  if (loading) return <NewsDetailSkeleton />;

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">Notícia não encontrada.</p>
        <button onClick={() => navigate(-1)} className="font-medium" style={{ color: BRAND }}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 -ml-1"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: BRAND }} />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Notícia</h1>
          <button
            type="button"
            onClick={handleShare}
            className="p-1 -mr-1"
            aria-label="Partilhar"
          >
            <Share2 className="w-5 h-5" style={{ color: BRAND }} />
          </button>
        </div>
      </header>

      {article.image_url && (
        <div className="w-full h-56 lg:h-72 bg-gray-100 max-w-3xl mx-auto">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="px-4 py-5 max-w-3xl mx-auto">
        <h2 className="text-[20px] lg:text-2xl font-bold text-gray-900 leading-snug mb-3">
          {article.title}
        </h2>

        <div className="flex items-center gap-4 text-[13px] text-gray-400 mb-5">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatNewsDate(article.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {article.author || "Redação"}
          </span>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-medium transition-colors",
              saved
                ? "border-[#2B58C5] bg-[#2B58C5]/10 text-[#2B58C5]"
                : "border-[#2B58C5]/40 text-[#2B58C5] hover:bg-[#2B58C5]/5"
            )}
          >
            <Heart className={cn("w-4 h-4", saved && "fill-current")} />
            Guardar
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2B58C5]/40 text-sm font-medium text-[#2B58C5] hover:bg-[#2B58C5]/5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Partilhar
          </button>
        </div>

        <div
          className="prose prose-sm lg:prose-base max-w-none text-gray-700 leading-relaxed
            [&_p]:mb-4 [&_strong]:font-semibold [&_a]:text-[#2B58C5]"
          dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
        />
      </div>

      <AiNewsFab
        title={article.title}
        content={article.content || article.excerpt}
      />
    </div>
  );
};

export default NoticiaDetalhe;
