import { useI18n } from "../../i18n/I18nProvider";

type RatingStarsProps = {
  value: number;
};

export function RatingStars({ value }: RatingStarsProps) {
  const { t } = useI18n();
  const normalized = Math.max(0, Math.min(5, Math.round(value)));
  const filled = "*".repeat(normalized);
  const empty = "*".repeat(5 - normalized);

  return (
    <span
      className="rating-stars"
      aria-label={t("rating.aria", { value: normalized })}
    >
      <span className="rating-stars-filled">{filled}</span>
      <span className="rating-stars-empty">{empty}</span>
    </span>
  );
}
