import { RatingStars } from "./RatingStars";

type AnimePosterCardProps = {
  title: string;
  image: string;
  rating: number;
};

export function AnimePosterCard({
  title,
  image,
  rating,
}: AnimePosterCardProps) {
  return (
    <article className="anime-poster-card">
      <div className="anime-poster-media">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="anime-poster-meta">
        <RatingStars value={rating} />
        <h4>{title}</h4>
      </div>
    </article>
  );
}
