import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { AppHeader } from "@/components/AppHeader";
import { CategoryChips } from "@/components/news/CategoryChips";
import { CategorySidebar } from "@/components/news/CategorySidebar";
import { newsAPI, formatNewsDate, getCategoryColor } from "@/services/news";
import type { NewsArticle, NewsCategory } from "@/types/news";
import { cn } from "@/lib/utils";
import { NewsListSkeleton, CategoryFilterSkeleton } from "@/components/news/NewsSkeletons";
import {
  CategoryNewsSection,
  FeaturedCategoryCard,
  HorizontalNewsCard,
  MiniNewsCard,
  NewsHorizontalRow,
  NewsSection,
  NewsVerticalList,
  getCategoryLayout,
} from "@/components/news/NewsCards";
import { useAuth } from "@/contexts/AuthContext";

const BRAND = "#2B58C5";

const Noticias = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [categoryPosts, setCategoryPosts] = useState<Record<number, NewsArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const openArticle = (article: NewsArticle) => {
    navigate(`/noticia/${article.id}`);
  };

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const cats =
        categories.length > 0 ? categories : await newsAPI.getCategories();
      if (categories.length === 0) setCategories(cats);

      if (selectedCategory || searchQuery) {
        const data = await newsAPI.getPosts({
          per_page: 20,
          search: searchQuery || undefined,
          category: selectedCategory ?? undefined,
        });
        setPosts(data.posts);
        setCategoryPosts({});
      } else {
        const [mainData, ...catResults] = await Promise.all([
          newsAPI.getPosts({ per_page: 20 }),
          ...cats.map((cat) =>
            newsAPI.getPosts({ per_page: 6, category: cat.id })
          ),
        ]);
        setPosts(mainData.posts);

        const byCategory: Record<number, NewsArticle[]> = {};
        cats.forEach((cat, i) => {
          byCategory[cat.id] = catResults[i]?.posts ?? [];
        });
        setCategoryPosts(byCategory);
      }
    } catch {
      setPosts([]);
      setCategoryPosts({});
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
    return () => carouselApi.off("select", onSelect);
  }, [carouselApi]);

  const highlights = posts.slice(0, 5);
  const recent = posts.slice(0, 8);
  const feedList = posts.slice(8, 14);
  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const isHomeView = !selectedCategory && !searchQuery;

  const categoryFilter = (
    <CategoryChips
      categories={categories}
      selectedCategory={selectedCategory}
      onSelect={setSelectedCategory}
    />
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={user}
        onLogout={logout}
        subtitle="Notícias e Jornais"
        searchPlaceholder="Pesquisar notícias..."
        categorySlot={categoryFilter}
      />

      <div className="mx-auto max-w-7xl flex">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <main className="flex-1 min-w-0 px-4 py-5 lg:px-6 lg:py-6">
          {loading && (isHomeView ? <NewsListSkeleton /> : <CategoryFilterSkeleton />)}

          {!loading && posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">Nenhuma notícia encontrada.</p>
            </div>
          )}

          {!loading && posts.length > 0 && isHomeView && (
            <>
              {highlights.length > 0 && (
                <section className="mb-7 lg:mb-10">
                  <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
                    <CarouselContent className="-ml-0">
                      {highlights.map((article) => (
                        <CarouselItem key={article.id} className="pl-0">
                          <button
                            type="button"
                            onClick={() => openArticle(article)}
                            className="relative w-full h-[210px] lg:h-[380px] rounded-[20px] overflow-hidden block text-left"
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
                            <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                              <h3 className="text-white font-bold text-[15px] lg:text-2xl leading-snug line-clamp-2 lg:line-clamp-3">
                                {article.title}
                              </h3>
                              <p className="text-white/75 text-[12px] lg:text-sm mt-1.5">
                                {formatNewsDate(article.date)}
                              </p>
                            </div>
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
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

              <NewsSection
                title="Recentes"
                subtitle="As notícias mais novas do O Destaque"
              >
                <NewsHorizontalRow articles={recent} onArticleClick={openArticle} />
              </NewsSection>

              {feedList.length > 0 && (
                <section className="mb-7 lg:mb-10">
                  <NewsVerticalList articles={feedList} onArticleClick={openArticle} />
                </section>
              )}

              {categories.map((cat, index) => (
                <CategoryNewsSection
                  key={cat.id}
                  title={cat.name}
                  subtitle={`Mais lidas e recentes em ${cat.name.toLowerCase()}`}
                  articles={categoryPosts[cat.id] ?? []}
                  layout={getCategoryLayout(index)}
                  onArticleClick={openArticle}
                />
              ))}
            </>
          )}

          {!loading && posts.length > 0 && !isHomeView && (
            <div className="space-y-4 lg:space-y-5">
              {activeCategory && (
                <div className="mb-2">
                  <h2 className="text-[17px] lg:text-xl font-bold text-gray-900">{activeCategory.name}</h2>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    Mais lidas e recentes em {activeCategory.name.toLowerCase()}
                  </p>
                </div>
              )}

              {searchQuery && !activeCategory && (
                <div className="mb-2">
                  <h2 className="text-[17px] lg:text-xl font-bold text-gray-900">Resultados</h2>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    {posts.length} notícia{posts.length !== 1 ? "s" : ""} encontrada{posts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-4 lg:space-y-0">
                {posts[0] && (
                  <MiniNewsCard article={posts[0]} onClick={() => openArticle(posts[0])} />
                )}
                {posts[1] && (
                  <FeaturedCategoryCard
                    article={posts[1]}
                    onClick={() => openArticle(posts[1])}
                  />
                )}
              </div>

              <NewsVerticalList
                articles={posts.slice(2)}
                onArticleClick={openArticle}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Noticias;
