type RatingStarsProps = {
  value: number;
};

export function RatingStars({ value }: RatingStarsProps) {
  const normalized = Math.max(0, Math.min(5, Math.round(value)));
  const filled = "*".repeat(normalized);
  const empty = "*".repeat(5 - normalized);

  return (
    <span className="rating-stars" aria-label={`Rating ${normalized} of 5`}>
      <span className="rating-stars-filled">{filled}</span>
      <span className="rating-stars-empty">{empty}</span>
    </span>
  );
}
