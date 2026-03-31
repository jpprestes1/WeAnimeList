import { useEffect, useState } from "react";

import { searchAnime, type AnimeSummary } from "../route/jikanApi";
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
              : "Could not load anime suggestions right now.",
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
    selectedAnime?.episodes ? `${selectedAnime.episodes} Episodes` : null,
  ]
    .filter(Boolean)
    .join(" - ");

  const shouldShowSuggestions =
    isSearchFocused && (isSearching || suggestions.length > 0 || !!searchError);

  return (
    <section className="review-page">
      <header className="review-header">
        <div>
          <h1>Create New Review</h1>
          <p>Share your thoughts on what you watched recently.</p>
        </div>
        <div className="review-header-actions">
          <button type="button" className="ghost">
            Cancel
          </button>
          <button type="button" className="primary">
            Publish Review
          </button>
        </div>
      </header>

      <div className="review-layout">
        <div className="review-main">
          <section className="panel">
            <h2>Select Anime</h2>
            <div className="anime-search-wrap">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsSearchFocused(false), 100);
                }}
                placeholder="Search for anime title..."
              />

              {shouldShowSuggestions && (
                <div className="anime-suggestions" role="listbox">
                  {isSearching && <p className="search-state">Searching...</p>}

                  {!isSearching && searchError && (
                    <p className="search-state error">{searchError}</p>
                  )}

                  {!isSearching && !searchError && suggestions.length === 0 && (
                    <p className="search-state">No anime found.</p>
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
                    No image
                  </div>
                )}
                <div>
                  <h3>{selectedAnime.title}</h3>
                  <p>{selectedMeta || "Details unavailable"}</p>
                  <div className="chip-row">
                    {selectedAnime.status && (
                      <span>{selectedAnime.status}</span>
                    )}
                    {typeof selectedAnime.score === "number" && (
                      <span>Score {selectedAnime.score.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Rating and Review</h2>
            <label htmlFor="review-title">Review Title (Optional)</label>
            <input
              id="review-title"
              type="text"
              placeholder="A visual masterpiece with pacing issues"
            />
            <label htmlFor="review-content">Your Thoughts</label>
            <textarea
              id="review-content"
              rows={7}
              placeholder="Write your in-depth review here. No spoilers please!"
            />
            <p className="small-muted">
              Markdown supported - 0 / 5000 characters
            </p>
          </section>

          <section className="recent-panel">
            <h2>Recent Reviews from Your Groups</h2>
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
            <h2>Share With</h2>
            <label htmlFor="group">Select Group</label>
            <select id="group" defaultValue="All Friends">
              <option>All Friends</option>
              <option>Shonen Enthusiasts</option>
              <option>Slice of Life Club</option>
              <option>Weekend Watchers</option>
            </select>
            <div className="toggle-row">
              <span>Contains Spoilers</span>
              <input type="checkbox" />
            </div>
            <div className="toggle-row">
              <span>Allow Comments</span>
              <input type="checkbox" defaultChecked />
            </div>
          </section>

          <section className="tips-card">
            <h3>Review Tips</h3>
            <ul>
              <li>Mention specific episodes that stood out.</li>
              <li>Discuss animation quality and sound design.</li>
              <li>Keep spoilers hidden or marked.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
