import { cn } from "@/lib/utils";

interface CategoryItem {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          selectedId === null
            ? "bg-primary text-primary-foreground shadow-glow"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        Tous
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selectedId === category.id
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
