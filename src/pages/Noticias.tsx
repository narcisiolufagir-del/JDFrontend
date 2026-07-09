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

const BRAND = "#2B58C5";
const CHIP_BG = "#F0F2F6";

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
  }, [loadNews, searchQuery, selectedCategory]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const highlights = posts.slice(0, 5);
  const recent = posts.slice(0, 8);

  const openArticle = (article: NewsArticle) => {
    navigate(`/noticia/${article.id}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white px-4 pt-5 pb-3">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1
              className="text-[26px] font-extrabold tracking-tight leading-none"
              style={{ color: BRAND }}
            >
              O DESTAQUE
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">Notícias e Jornais</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button type="button" className="p-2 -mr-1 text-gray-800" aria-label="Menu">
                <Menu className="w-6 h-6" strokeWidth={2} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white">
              <SheetHeader>
                <SheetTitle className="text-gray-900">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-gray-900"
                  onClick={() => navigate("/profile")}
                >
                  Minha Conta
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-gray-900"
                  onClick={() => navigate("/jornais")}
                >
                  Jornais Digitais
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-gray-900"
                  onClick={() => navigate("/policy")}
                >
                  Política de Privacidade
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar notícias, temas ou lugares..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-[46px] rounded-full border-0 text-[14px] text-gray-800 placeholder:text-gray-400 shadow-none focus-visible:ring-2 focus-visible:ring-[#2B58C5]/25"
            style={{ backgroundColor: CHIP_BG }}
          />
        </div>
      </header>

      {/* Category chips */}
      <div className="px-4 pb-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max py-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors",
              selectedCategory === null ? "text-white" : "text-gray-700"
            )}
            style={{
              backgroundColor: selectedCategory === null ? BRAND : CHIP_BG,
            }}
          >
            Tudo
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat.id ? "text-white" : "text-gray-700"
              )}
              style={{
                backgroundColor: selectedCategory === cat.id ? BRAND : CHIP_BG,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND }} />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Nenhuma notícia encontrada.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            {/* Destaques */}
            {highlights.length > 0 && !searchQuery && (
              <section className="mb-7">
                <div className="mb-3">
                  <h2 className="text-[17px] font-bold text-gray-900">Destaques</h2>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    As principais notícias do dia
                  </p>
                </div>

                <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
                  <CarouselContent className="-ml-0">
                    {highlights.map((article) => (
                      <CarouselItem key={article.id} className="pl-0">
                        <button
                          type="button"
                          onClick={() => openArticle(article)}
                          className="relative w-full h-[210px] rounded-[20px] overflow-hidden block text-left"
                        >
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="absolute inset-0"
                              style={{ background: `linear-gradient(135deg, ${BRAND}, #4a7ae0)` }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                          {article.category && (
                            <span
                              className={cn(
                                "absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white",
                                getCategoryColor(article.category.slug)
                              )}
                            >
                              {article.category.name}
                            </span>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-[15px] leading-snug line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-white/75 text-[12px] mt-1.5">
                              {formatNewsDate(article.date)}
                            </p>
                          </div>
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Carousel dots */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {highlights.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={cn(
                        "h-[6px] rounded-full transition-all",
                        i === currentSlide ? "w-5" : "w-[6px] bg-gray-300"
                      )}
                      style={i === currentSlide ? { backgroundColor: BRAND } : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recentes — só imagens, scroll horizontal */}
            <section className="pb-4">
              <div className="mb-3">
                <h2 className="text-[17px] font-bold text-gray-900">Recentes</h2>
                <p className="text-[13px] text-gray-400 mt-0.5">
                  As notícias mais novas do O Destaque
                </p>
              </div>

              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {recent.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => openArticle(article)}
                    className="flex-shrink-0 w-[148px]"
                  >
                    <div className="w-[148px] h-[120px] rounded-[16px] overflow-hidden bg-gray-100">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: `linear-gradient(135deg, ${BRAND}33, ${BRAND}11)` }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Noticias;
