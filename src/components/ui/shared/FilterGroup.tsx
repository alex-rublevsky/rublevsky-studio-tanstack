import { cn } from "~/utils/utils";
import { cva } from "class-variance-authority";
import { useCursorHover } from "~/components/ui/shared/custom_cursor/CustomCursorContext";

interface FilterOption {
  slug: string;
  name: string;
}
interface FilterButtonProps {
  onClick: () => void;
  isSelected: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "product";
  title?: string;
}

const buttonVariants = cva("transition-all duration-200 border", {
  variants: {
    variant: {
      default:
        "px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-full",
      product: "px-2 py-1 text-xs rounded-full",
    },
    state: {
      selected: "border-black bg-black text-white",
      unselected:
        "border-border bg-background/80 hover:border-black hover:bg-black/5 active:scale-95",
      disabled:
        "border-border bg-muted hover:border-black text-muted-foreground",
      "selected-disabled":
        "border-muted-foreground bg-muted/50 text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
    state: "unselected",
  },
});

function FilterButton({
  onClick,
  isSelected,
  isDisabled = false,
  children,
  className,
  variant = "default",
  title,
}: FilterButtonProps) {
  const state = isDisabled
    ? isSelected
      ? "selected-disabled"
      : "disabled"
    : isSelected
      ? "selected"
      : "unselected";

  // Determine effective cursor behavior - disabled buttons use "block" cursor
  const effectiveCursorType = isDisabled ? "block" : "small";

  const { handleMouseEnter, handleMouseLeave } = useCursorHover(
    effectiveCursorType,
    isDisabled
  );

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      className={cn(
        // Use cursor-not-allowed for disabled buttons, cursor-pointer for enabled buttons
        "cursor-pointer",
        buttonVariants({ variant, state }),
        className
      )}
      title={title}
      onMouseEnter={handleMouseEnter()}
      onMouseLeave={handleMouseLeave()}
    >
      {children}
    </button>
  );
}

interface FilterGroupProps {
  title?: string;
  options: (FilterOption | string)[];
  selectedOptions: string | string[] | null;
  onOptionChange: (option: string | null) => void;
  onOptionsChange?: (options: string[]) => void;
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  multiSelect?: boolean;
  variant?: "default" | "product";
  getOptionAvailability?: (option: string) => boolean;
  titleClassName?: string;
}

export function FilterGroup({
  title,
  options,
  selectedOptions,
  onOptionChange,
  onOptionsChange,
  className,
  showAllOption = true,
  allOptionLabel = "All",
  multiSelect = false,
  variant = "default",
  getOptionAvailability,
  titleClassName,
}: FilterGroupProps) {
  const handleOptionClick = (optionSlug: string) => {
    if (multiSelect && onOptionsChange) {
      const selected = selectedOptions as string[];
      if (selected.includes(optionSlug)) {
        onOptionsChange(selected.filter((slug) => slug !== optionSlug));
      } else {
        onOptionsChange([...selected, optionSlug]);
      }
    } else {
      onOptionChange(
        optionSlug === (selectedOptions as string) ? null : optionSlug
      );
    }
  };

  const isSelected = (optionSlug: string) => {
    if (multiSelect) {
      return (selectedOptions as string[]).includes(optionSlug);
    }
    return selectedOptions === optionSlug;
  };

  const getOptionName = (option: FilterOption | string) => {
    return typeof option === "string" ? option : option.name;
  };

  const getOptionSlug = (option: FilterOption | string) => {
    return typeof option === "string" ? option : option.slug;
  };

  return (
    <div className="space-y-2">
      {title && (
        <div
          className={cn(
            variant === "product"
              ? "text-xs font-medium text-muted-foreground mb-1"
              : "text-sm font-medium",
            titleClassName
          )}
        >
          {title}
        </div>
      )}
      <div className={cn("flex flex-wrap gap-1", className)}>
        {showAllOption && !multiSelect && (
          <FilterButton
            onClick={() => onOptionChange(null)}
            isSelected={selectedOptions === null}
            variant={variant}
          >
            {allOptionLabel}
          </FilterButton>
        )}
        {options.map((option) => {
          const optionSlug = getOptionSlug(option);
          const isAvailable = getOptionAvailability
            ? getOptionAvailability(optionSlug)
            : true;

          return (
            <FilterButton
              key={optionSlug}
              onClick={() => handleOptionClick(optionSlug)}
              isSelected={isSelected(optionSlug)}
              isDisabled={!isAvailable}
              variant={variant}
              title={!isAvailable ? "This option is not available" : undefined}
            >
              {getOptionName(option)}
            </FilterButton>
          );
        })}
      </div>
    </div>
  );
}
