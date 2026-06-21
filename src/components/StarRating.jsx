export default function StarRating({ rating = 0, max = 5, size = "sm", interactive = false, onChange }) {
  const sizeClass = size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm";

  return (
    <div className={`flex items-center gap-0.5 ${sizeClass}`} role={interactive ? "group" : undefined}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(rating);
        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            className={`leading-none ${
              interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"
            } ${filled ? "text-amber-400" : "text-slate-300"}`}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
