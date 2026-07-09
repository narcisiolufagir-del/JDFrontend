import { cn } from "@/lib/utils";
import type { NewsCategory } from "@/types/news";

const BRAND = "#2B58C5";
const CHIP_BG = "#F0F2F6";

type CategoryChipsProps = {
  categories: NewsCategory[];
  selectedCategory: number | null;
  onSelect: (id: number | null) => void;
  className?: string;
};

export function CategoryChips({
  categories,
  selectedCategory,
  onSelect,
  className,
}: CategoryChipsProps) {
  return (
    <div className={cn("overflow-x-auto scrollbar-hide", className)}>
      <div className="flex gap-2 min-w-max py-1">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors",
            selectedCategory === null ? "text-white" : "text-gray-700"
          )}
          style={{ backgroundColor: selectedCategory === null ? BRAND : CHIP_BG }}
        >
          Tudo
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors",
              selectedCategory === cat.id ? "text-white" : "text-gray-700"
            )}
            style={{ backgroundColor: selectedCategory === cat.id ? BRAND : CHIP_BG }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
