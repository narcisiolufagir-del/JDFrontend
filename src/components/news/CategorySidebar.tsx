import { cn } from "@/lib/utils";
import type { NewsCategory } from "@/types/news";
import { LayoutGrid } from "lucide-react";

const BRAND = "#2B58C5";

type CategorySidebarProps = {
  categories: NewsCategory[];
  selectedCategory: number | null;
  onSelect: (id: number | null) => void;
};

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelect,
}: CategorySidebarProps) {
  return (
    <aside className="hidden lg:block w-56 shrink-0 border-r border-gray-100 bg-white">
      <div className="sticky top-16 py-5 pr-4 pl-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-3">
          Categorias
        </p>
        <nav className="space-y-0.5">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors",
              selectedCategory === null
                ? "text-white"
                : "text-gray-700 hover:bg-gray-50"
            )}
            style={selectedCategory === null ? { backgroundColor: BRAND } : undefined}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            Todas as notícias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors",
                selectedCategory === cat.id
                  ? "text-white"
                  : "text-gray-700 hover:bg-gray-50"
              )}
              style={selectedCategory === cat.id ? { backgroundColor: BRAND } : undefined}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  selectedCategory === cat.id ? "bg-white/80" : "bg-emerald-500"
                )}
              />
              {cat.name}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
