import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Heart,
  Calendar,
  User,
  Sparkles,
} from "lucide-react";
import { newsAPI, formatNewsDate } from "@/services/news";
import { streamNewsSummary } from "@/services/ai";
import type { NewsArticle } from "@/types/news";
import { NewsDetailSkeleton, AiSummarySkeleton } from "@/components/news/NewsSkeletons";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BRAND = "#2B58C5";

const NoticiaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadSummary = useCallback(async (art: NewsArticle) => {
    setAiLoading(true);
    setAiError(null);
    setAiSummary("");

    await streamNewsSummary(art.title, art.content || art.excerpt, {
      onStart: () => setAiLoading(true),
      onDelta: (_text, fullText) => {
        setAiSummary(fullText);
        setAiLoading(false);
      },
      onDone: (fullText) => {
        setAiSummary(fullText);
        setAiLoading(false);
      },
      onError: (msg) => {
        setAiError(msg);
        setAiLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    newsAPI
      .getPost(Number(id))
      .then((art) => {
        setArticle(art);
        void loadSummary(art);
      })
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [id, loadSummary]);

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
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
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

      {/* Hero image */}
      {article.image_url && (
        <div className="w-full h-56 bg-gray-100">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="px-4 py-5 max-w-2xl mx-auto">
        {/* Title */}
        <h2 className="text-[20px] font-bold text-gray-900 leading-snug mb-3">
          {article.title}
        </h2>

        {/* Meta */}
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

        {/* Action buttons */}
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

        {/* AI Summary */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: BRAND }} />
            <h3 className="text-sm font-semibold text-gray-900">Resumo com IA</h3>
          </div>

          {aiLoading && !aiSummary && <AiSummarySkeleton />}

          {aiError && !aiSummary && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {aiError}
            </div>
          )}

          {aiSummary && (
            <div className="rounded-xl border border-[#2B58C5]/20 bg-[#2B58C5]/5 p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aiSummary}
                {aiLoading && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#2B58C5] animate-pulse rounded-sm" />
                )}
              </p>
            </div>
          )}
        </section>

        {/* Article body */}
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed
            [&_p]:mb-4 [&_strong]:font-semibold [&_a]:text-[#2B58C5]"
          dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
        />
      </div>
    </div>
  );
};

export default NoticiaDetalhe;
