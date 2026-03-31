import { useEffect, useState } from "react";

import { searchAnime, type AnimeSummary } from "../route/jikanApi";
import { useI18n } from "../i18n/I18nProvider";
import "../styles/review.css";

const recentReviews = [
  {
    user: "Iuri",
    when: "2 hours ago",
    score: 9.5,
    text: "Attack on Titan: The Final Season is a complete rollercoaster.",
  },
  {
    user: "Batata",
    when: "5 hours ago",
    score: 7.0,
    text: "One Piece has peaks and valleys, but Wano still looks amazing.",
  },
  {
    user: "Jao",
    when: "1 day ago",
    score: 8.2,
    text: "Vinland Saga S2 is subtle, mature and emotionally sharp.",
  },
  {
    user: "Caio",
    when: "2 days ago",
    score: 6.5,
    text: "Tokyo Revengers keeps me curious, even when logic stretches.",
  },
];

export function CreateAnimeReviewPage() {
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AnimeSummary[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeSummary | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setSuggestions([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const response = await searchAnime({
          q: normalizedQuery,
          limit: 6,
          order_by: "popularity",
        });

        if (!cancelled) {
          setSuggestions(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestions([]);
          setSearchError(
            error instanceof Error
              ? error.message
              : t("review.searchFallbackError"),
          );
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  function handleSelectAnime(anime: AnimeSummary) {
    setSelectedAnime(anime);
    setQuery(anime.title_english?.trim() ? anime.title_english : anime.title);
    setSuggestions([]);
    setSearchError(null);
    setIsSearchFocused(false);
  }

  const selectedPosterUrl =
    selectedAnime?.images?.webp?.large_image_url ??
    selectedAnime?.images?.webp?.image_url ??
    selectedAnime?.images?.jpg?.large_image_url ??
    selectedAnime?.images?.jpg?.image_url;

  const selectedMeta = [
    selectedAnime?.type,
    selectedAnime?.year ? String(selectedAnime.year) : null,
    selectedAnime?.episodes
      ? t("review.episodes", { count: selectedAnime.episodes })
      : null,
  ]
    .filter(Boolean)
    .join(" - ");

  const shouldShowSuggestions =
    isSearchFocused && (isSearching || suggestions.length > 0 || !!searchError);

  return (
    <section className="review-page">
      <header className="review-header">
        <div>
          <h1>{t("review.title")}</h1>
          <p>{t("review.subtitle")}</p>
        </div>
        <div className="review-header-actions">
          <button type="button" className="ghost">
            {t("common.cancel")}
          </button>
          <button type="button" className="primary">
            {t("common.publishReview")}
          </button>
        </div>
      </header>

      <div className="review-layout">
        <div className="review-main">
          <section className="panel">
            <h2>{t("review.selectAnime")}</h2>
            <div className="anime-search-wrap">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsSearchFocused(false), 100);
                }}
                placeholder={t("review.searchPlaceholder")}
              />

              {shouldShowSuggestions && (
                <div className="anime-suggestions" role="listbox">
                  {isSearching && (
                    <p className="search-state">{t("common.searching")}</p>
                  )}

                  {!isSearching && searchError && (
                    <p className="search-state error">{searchError}</p>
                  )}

                  {!isSearching && !searchError && suggestions.length === 0 && (
                    <p className="search-state">{t("common.noAnimeFound")}</p>
                  )}

                  {!isSearching &&
                    !searchError &&
                    suggestions.map((anime) => {
                      const poster =
                        anime.images?.webp?.image_url ??
                        anime.images?.jpg?.image_url ??
                        anime.images?.jpg?.large_image_url;

                      return (
                        <button
                          key={anime.mal_id}
                          type="button"
                          className="anime-suggestion-item"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectAnime(anime)}
                        >
                          {poster ? (
                            <img src={poster} alt={anime.title} />
                          ) : (
                            <div
                              className="anime-thumb-fallback"
                              aria-hidden="true"
                            >
                              ?
                            </div>
                          )}
                          <span>
                            <strong>{anime.title}</strong>
                            <small>
                              {[anime.type, anime.year]
                                .filter(Boolean)
                                .join(" - ")}
                            </small>
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {selectedAnime && (
              <div className="selected-anime">
                {selectedPosterUrl ? (
                  <img src={selectedPosterUrl} alt={selectedAnime.title} />
                ) : (
                  <div className="selected-anime-fallback" aria-hidden="true">
                    {t("common.noImage")}
                  </div>
                )}
                <div>
                  <h3>{selectedAnime.title}</h3>
                  <p>{selectedMeta || t("common.detailsUnavailable")}</p>
                  <div className="chip-row">
                    {selectedAnime.status && (
                      <span>{selectedAnime.status}</span>
                    )}
                    {typeof selectedAnime.score === "number" && (
                      <span>
                        {t("review.scoreLabel", {
                          value: selectedAnime.score.toFixed(1),
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>{t("review.ratingReview")}</h2>
            <label htmlFor="review-title">{t("review.reviewTitleLabel")}</label>
            <input
              id="review-title"
              type="text"
              placeholder={t("review.reviewTitlePlaceholder")}
            />
            <label htmlFor="review-content">{t("review.thoughtsLabel")}</label>
            <textarea
              id="review-content"
              rows={7}
              placeholder={t("review.thoughtsPlaceholder")}
            />
            <p className="small-muted">{t("review.markdownHelp")}</p>
          </section>

          <section className="recent-panel">
            <h2>{t("review.recentReviews")}</h2>
            <div className="recent-grid">
              {recentReviews.map((item) => (
                <article key={item.user} className="recent-card">
                  <div className="recent-head">
                    <strong>{item.user}</strong>
                    <span>{item.when}</span>
                    <b>{item.score.toFixed(1)}</b>
                  </div>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="review-side">
          <section className="panel sticky">
            <h2>{t("review.shareWith")}</h2>
            <label htmlFor="group">{t("review.selectGroup")}</label>
            <select id="group" defaultValue={t("review.groupAllFriends")}>
              <option>{t("review.groupAllFriends")}</option>
              <option>{t("review.groupShonen")}</option>
              <option>{t("review.groupSlice")}</option>
              <option>{t("review.groupWeekend")}</option>
            </select>
            <div className="toggle-row">
              <span>{t("review.containsSpoilers")}</span>
              <input type="checkbox" />
            </div>
            <div className="toggle-row">
              <span>{t("review.allowComments")}</span>
              <input type="checkbox" defaultChecked />
            </div>
          </section>

          <section className="tips-card">
            <h3>{t("review.reviewTips")}</h3>
            <ul>
              <li>{t("review.tip1")}</li>
              <li>{t("review.tip2")}</li>
              <li>{t("review.tip3")}</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
