import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { newsAPI, formatNewsDate, getCategoryColor } from "@/services/news";
import type { NewsArticle, NewsCategory } from "@/types/news";
import { cn } from "@/lib/utils";

const Noticias = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, data] = await Promise.all([
        categories.length === 0 ? newsAPI.getCategories() : Promise.resolve(categories),
        newsAPI.getPosts({
          per_page: 20,
          search: searchQuery || undefined,
          category: selectedCategory ?? undefined,
        }),
      ]);
      if (categories.length === 0) setCategories(cats);
      setPosts(data.posts);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, categories]);

  useEffect(() => {
    const timer = setTimeout(loadNews, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [loadNews, searchQuery]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const highlights = posts.slice(0, 5);
  const recent = posts.slice(0, 10);

  const openArticle = (article: NewsArticle) => {
    navigate(`/noticia/${article.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white px-4 pt-4 pb-3">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a56db] tracking-tight leading-none">
              O DESTAQUE
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Notícias e Jornais</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 -mr-2 text-gray-700">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/profile")}>
                  Minha Conta
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/jornais")}>
                  Jornais Digitais
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/policy")}>
                  Política de Privacidade
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar notícias, temas ou lugares..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-full bg-gray-100 border-0 text-sm placeholder:text-gray-400 focus-visible:ring-[#1a56db]/30"
          />
        </div>
      </header>

      {/* Category chips */}
      <div className="px-4 pb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedCategory === null
                ? "bg-[#1a56db] text-white"
                : "bg-gray-100 text-gray-600"
            )}
          >
            Tudo
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat.id
                  ? "bg-[#1a56db] text-white"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a56db]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 px-4">
          <p className="text-gray-500">Nenhuma notícia encontrada.</p>
        </div>
      ) : (
        <>
          {/* Destaques */}
          {highlights.length > 0 && !searchQuery && (
            <section className="px-4 mb-6">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-gray-900">Destaques</h2>
                <p className="text-sm text-gray-400">As principais notícias do dia</p>
              </div>

              <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
                <CarouselContent className="-ml-0">
                  {highlights.map((article) => (
                    <CarouselItem key={article.id} className="pl-0">
                      <button
                        onClick={() => openArticle(article)}
                        className="relative w-full h-52 rounded-2xl overflow-hidden block text-left"
                      >
                        {article.image_url ? (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1a56db] to-blue-400" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {article.category && (
                          <span
                            className={cn(
                              "absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold text-white",
                              getCategoryColor(article.category.slug)
                            )}
                          >
                            {article.category.name}
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-base leading-snug line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-white/70 text-xs mt-1">
                            {formatNewsDate(article.date)}
                          </p>
                        </div>
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Dots */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {highlights.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => carouselApi?.scrollTo(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === currentSlide ? "w-5 bg-[#1a56db]" : "w-1.5 bg-gray-300"
                    )}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recentes */}
          <section className="px-4 mb-6">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-900">Recentes</h2>
              <p className="text-sm text-gray-400">As notícias mais novas do O Destaque</p>
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {recent.map((article) => (
                <button
                  key={article.id}
                  onClick={() => openArticle(article)}
                  className="flex-shrink-0 w-36 text-left"
                >
                  <div className="w-36 h-28 rounded-xl overflow-hidden mb-2 bg-gray-100">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a56db]/20 to-blue-100" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
                    {article.title}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Lista completa */}
          <section className="px-4 pb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Todas as notícias</h2>
            <div className="space-y-4">
              {posts.map((article) => (
                <button
                  key={article.id}
                  onClick={() => openArticle(article)}
                  className="flex gap-3 w-full text-left"
                >
                  <div className="w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a56db]/20 to-blue-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {article.category && (
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mb-1",
                          getCategoryColor(article.category.slug)
                        )}
                      >
                        {article.category.name}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatNewsDate(article.date)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Noticias;
