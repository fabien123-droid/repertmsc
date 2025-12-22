import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Rechercher un chant...", className }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn(
      "relative group",
      className
    )}>
      <Search className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
        isFocused ? "text-primary" : "text-muted-foreground"
      )} />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "pl-12 pr-10 h-14 text-base rounded-2xl border-2 bg-card",
          "placeholder:text-muted-foreground/60",
          "transition-all duration-200",
          isFocused ? "border-primary/50 shadow-glow" : "border-border hover:border-muted-foreground/30"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
