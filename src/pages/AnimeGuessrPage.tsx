import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getRandomAnime,
  getTopAnime,
  searchAnime,
  type AnimeSummary,
} from "../route/jikanApi";
import { useI18n } from "../i18n/I18nProvider";
import "../styles/guessr.css";

type GuessOption = {
  mal_id: number;
  title: string;
};

type GuessrMode = "classic" | "anidle";

type HintState = "match" | "close" | "higher" | "lower" | "wrong" | "unknown";

type AnidleHint = {
  type: HintState;
  year: HintState;
  episodes: HintState;
  score: HintState;
  source: HintState;
};

function pickShuffled<T>(list: T[], amount: number): T[] {
  const cloned = [...list];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }

  return cloned.slice(0, amount);
}

function resolvePosterUrl(anime: AnimeSummary | null): string | null {
  if (!anime) return null;

  return (
    anime.images?.webp?.large_image_url ??
    anime.images?.webp?.image_url ??
    anime.images?.jpg?.large_image_url ??
    anime.images?.jpg?.image_url ??
    null
  );
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isMovieType(value: string | null | undefined): boolean {
  return normalizeText(value) === "movie";
}

function compareText(
  guessValue: string | null | undefined,
  targetValue: string | null | undefined,
): HintState {
  if (!guessValue || !targetValue) {
    return "unknown";
  }

  return normalizeText(guessValue) === normalizeText(targetValue)
    ? "match"
    : "wrong";
}

function compareNumber(
  guessValue: number | null | undefined,
  targetValue: number | null | undefined,
  closeThreshold: number,
): HintState {
  if (
    typeof guessValue !== "number" ||
    Number.isNaN(guessValue) ||
    typeof targetValue !== "number" ||
    Number.isNaN(targetValue)
  ) {
    return "unknown";
  }

  if (guessValue === targetValue) {
    return "match";
  }

  if (Math.abs(guessValue - targetValue) <= closeThreshold) {
    return "close";
  }

  return guessValue < targetValue ? "higher" : "lower";
}

function buildAnidleHint(
  guess: AnimeSummary,
  target: AnimeSummary,
): AnidleHint {
  return {
    type: compareText(guess.type, target.type),
    year: compareNumber(guess.year, target.year, 1),
    episodes: compareNumber(guess.episodes, target.episodes, 1),
    score: compareNumber(guess.score, target.score, 0.1),
    source: compareText(guess.source, target.source),
  };
}

function hintClassName(state: HintState): string {
  return `anidle-cell ${state}`;
}

function animeDisplayTitle(anime: AnimeSummary): string {
  return anime.title_english?.trim() ? anime.title_english : anime.title;
}

function formatGuessValue(value: string | number | null | undefined): string {
  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return "-";
}

function formatScoreValue(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return value.toFixed(2);
}

export function AnimeGuessrPage() {
  const { t } = useI18n();

  const [mode, setMode] = useState<GuessrMode>("classic");

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [currentAnime, setCurrentAnime] = useState<AnimeSummary | null>(null);
  const [options, setOptions] = useState<GuessOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  const [isLoadingRound, setIsLoadingRound] = useState(true);
  const [roundError, setRoundError] = useState<string | null>(null);

  const [anidleRound, setAnidleRound] = useState(1);
  const [anidleScore, setAnidleScore] = useState(0);
  const [anidleTargetAnime, setAnidleTargetAnime] =
    useState<AnimeSummary | null>(null);
  const [anidleGuesses, setAnidleGuesses] = useState<AnimeSummary[]>([]);
  const [anidleQuery, setAnidleQuery] = useState("");
  const [anidleSuggestions, setAnidleSuggestions] = useState<AnimeSummary[]>(
    [],
  );
  const [anidleError, setAnidleError] = useState<string | null>(null);
  const [isLoadingAnidleRound, setIsLoadingAnidleRound] = useState(false);
  const [isSearchingAnidle, setIsSearchingAnidle] = useState(false);
  const [isAnidleSearchFocused, setIsAnidleSearchFocused] = useState(false);
  const [anidleSolved, setAnidleSolved] = useState(false);
  const [anidleGaveUp, setAnidleGaveUp] = useState(false);
  const [anidleRevealedHints, setAnidleRevealedHints] = useState(0);

  const posterUrl = resolvePosterUrl(currentAnime);
  const hasAnswered = selectedOptionId !== null;
  const correctId = currentAnime?.mal_id ?? null;

  const isCorrectAnswer =
    hasAnswered && correctId !== null ? selectedOptionId === correctId : false;

  const anidleHasEnded = anidleSolved || anidleGaveUp;
  const anidleMaxHints = 2;
  const shouldShowAnidleSuggestions =
    isAnidleSearchFocused &&
    (isSearchingAnidle || anidleSuggestions.length > 0 || !!anidleError);
  const anidleCoverUrl = resolvePosterUrl(anidleTargetAnime);

  const hintText = useMemo(() => {
    if (!currentAnime) {
      return t("common.searching");
    }

    return [
      currentAnime.type,
      currentAnime.year ? String(currentAnime.year) : null,
      currentAnime.episodes
        ? t("guessr.epsShort", { count: currentAnime.episodes })
        : null,
      currentAnime.season,
    ]
      .filter(Boolean)
      .join(" • ");
  }, [currentAnime, t]);

  const loadRound = useCallback(async () => {
    setIsLoadingRound(true);
    setRoundError(null);
    setSelectedOptionId(null);

    try {
      const [randomAnimeResponse, topAnimeResponse] = await Promise.all([
        getRandomAnime(),
        getTopAnime({ limit: 25, page: Math.floor(Math.random() * 10) + 1 }),
      ]);

      const randomAnime = randomAnimeResponse.data;

      const candidateOptions = topAnimeResponse.data
        .filter((anime) => anime.mal_id !== randomAnime.mal_id)
        .map((anime) => ({
          mal_id: anime.mal_id,
          title: anime.title_english?.trim()
            ? anime.title_english
            : anime.title,
        }))
        .filter((anime) => anime.title.trim().length > 0);

      const distractors = pickShuffled(candidateOptions, 3);

      if (distractors.length < 3) {
        throw new Error(t("guessr.roundOptionError"));
      }

      const correctOption: GuessOption = {
        mal_id: randomAnime.mal_id,
        title: randomAnime.title_english?.trim()
          ? randomAnime.title_english
          : randomAnime.title,
      };

      setCurrentAnime(randomAnime);
      setOptions(pickShuffled([correctOption, ...distractors], 4));
    } catch (error) {
      setCurrentAnime(null);
      setOptions([]);
      setRoundError(
        error instanceof Error ? error.message : t("guessr.roundLoadError"),
      );
    } finally {
      setIsLoadingRound(false);
    }
  }, []);

  const loadAnidleRound = useCallback(async () => {
    setIsLoadingAnidleRound(true);
    setAnidleError(null);
    setAnidleSuggestions([]);
    setAnidleQuery("");
    setAnidleGuesses([]);
    setAnidleSolved(false);
    setAnidleGaveUp(false);
    setAnidleRevealedHints(0);
    setIsAnidleSearchFocused(false);

    try {
      const response = await getTopAnime({
        limit: 25,
        page: Math.floor(Math.random() * 12) + 1,
      });

      const candidates = response.data.filter(
        (anime) =>
          !isMovieType(anime.type) &&
          anime.title.trim().length > 0 &&
          typeof anime.year === "number" &&
          typeof anime.episodes === "number",
      );

      const randomTarget = pickShuffled(candidates, 1)[0];

      if (!randomTarget) {
        throw new Error(t("guessr.anidlePrepareError"));
      }

      setAnidleTargetAnime(randomTarget);
    } catch (error) {
      setAnidleTargetAnime(null);
      setAnidleError(
        error instanceof Error ? error.message : t("guessr.anidleLoadError"),
      );
    } finally {
      setIsLoadingAnidleRound(false);
    }
  }, [t]);

  useEffect(() => {
    void loadRound();
  }, [loadRound]);

  useEffect(() => {
    void loadAnidleRound();
  }, [loadAnidleRound]);

  useEffect(() => {
    const normalizedQuery = anidleQuery.trim();

    if (
      mode !== "anidle" ||
      normalizedQuery.length < 2 ||
      !anidleTargetAnime ||
      anidleHasEnded
    ) {
      setAnidleSuggestions([]);
      setIsSearchingAnidle(false);
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingAnidle(true);
      setAnidleError(null);

      try {
        const response = await searchAnime({
          q: normalizedQuery,
          limit: 8,
          order_by: "popularity",
        });

        const guessedIds = new Set(anidleGuesses.map((anime) => anime.mal_id));

        const filteredSuggestions = response.data
          .filter((anime) => anime.mal_id !== anidleTargetAnime.mal_id)
          .filter((anime) => !guessedIds.has(anime.mal_id))
          .filter((anime) => !isMovieType(anime.type))
          .filter((anime) => anime.title.trim().length > 0)
          .slice(0, 6);

        if (!cancelled) {
          setAnidleSuggestions(filteredSuggestions);
        }
      } catch (error) {
        if (!cancelled) {
          setAnidleSuggestions([]);
          setAnidleError(
            error instanceof Error
              ? error.message
              : t("guessr.searchSuggestionError"),
          );
        }
      } finally {
        if (!cancelled) {
          setIsSearchingAnidle(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [anidleGuesses, anidleHasEnded, anidleQuery, anidleTargetAnime, mode, t]);

  function handleOptionClick(optionId: number) {
    if (hasAnswered || !currentAnime) {
      return;
    }

    setSelectedOptionId(optionId);

    if (optionId === currentAnime.mal_id) {
      setScore((prevScore) => prevScore + 100 + streak * 20);
      setStreak((prevStreak) => prevStreak + 1);
      return;
    }

    setStreak(0);
  }

  function handleNextRound() {
    setRound((prevRound) => prevRound + 1);
    void loadRound();
  }

  function handleSkipRound() {
    setStreak(0);
    setRound((prevRound) => prevRound + 1);
    void loadRound();
  }

  function handleAnidleGuess(anime: AnimeSummary) {
    if (!anidleTargetAnime || anidleHasEnded || isLoadingAnidleRound) {
      return;
    }

    if (anidleGuesses.some((guess) => guess.mal_id === anime.mal_id)) {
      return;
    }

    const nextGuesses = [anime, ...anidleGuesses];
    setAnidleGuesses(nextGuesses);
    setAnidleQuery("");
    setAnidleSuggestions([]);

    if (anime.mal_id === anidleTargetAnime.mal_id) {
      setAnidleSolved(true);
      setAnidleScore(
        (prevScore) =>
          prevScore + Math.max(200, 800 - nextGuesses.length * 110),
      );
      return;
    }
  }

  function handleNextAnidleRound() {
    setAnidleRound((prevRound) => prevRound + 1);
    void loadAnidleRound();
  }

  function handleGiveUpAnidleRound() {
    if (!anidleTargetAnime || anidleHasEnded || isLoadingAnidleRound) {
      return;
    }

    setAnidleGaveUp(true);
    setAnidleQuery("");
    setAnidleSuggestions([]);
    setIsAnidleSearchFocused(false);
  }

  function handleRevealAnidleHint() {
    if (!anidleTargetAnime || anidleHasEnded) {
      return;
    }

    setAnidleRevealedHints((previous) =>
      Math.min(anidleMaxHints, previous + 1),
    );
  }

  const anidleTargetTitle = anidleTargetAnime
    ? animeDisplayTitle(anidleTargetAnime)
    : "";

  return (
    <section className="guessr-page">
      <header className="guessr-header">
        <div>
          <h1>{t("guessr.title")}</h1>
          <p>{t("guessr.subtitle")}</p>

          <div
            className="guessr-mode-switch"
            role="tablist"
            aria-label="Game modes"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "classic"}
              className={mode === "classic" ? "active" : ""}
              onClick={() => setMode("classic")}
            >
              {t("guessr.classicMode")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "anidle"}
              className={mode === "anidle" ? "active" : ""}
              onClick={() => setMode("anidle")}
            >
              {t("guessr.anidleMode")}
            </button>
          </div>
        </div>

        <div className="guessr-scoreboard" aria-label="Round status">
          <article>
            <span>{t("common.round")}</span>
            <strong>{mode === "classic" ? round : anidleRound}</strong>
          </article>
          <article>
            <span>{t("common.score")}</span>
            <strong>{mode === "classic" ? score : anidleScore}</strong>
          </article>
          <article>
            <span>
              {mode === "classic" ? t("common.streak") : t("common.guesses")}
            </span>
            <strong>
              {mode === "classic" ? streak : anidleGuesses.length}
            </strong>
          </article>
        </div>
      </header>

      <div className="guessr-layout">
        <section className="guessr-panel">
          {mode === "classic" && isLoadingRound ? (
            <p className="guessr-state">{t("guessr.loadingRound")}</p>
          ) : mode === "classic" && roundError ? (
            <div className="guessr-state-wrap">
              <p className="guessr-state error">{roundError}</p>
              <button type="button" onClick={() => void loadRound()}>
                {t("common.tryAgain")}
              </button>
            </div>
          ) : mode === "classic" ? (
            <>
              <div className="guessr-poster-wrap">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={t("guessr.posterClueAlt")}
                    className={hasAnswered ? "revealed" : "hidden"}
                  />
                ) : (
                  <div className="guessr-poster-fallback">
                    {t("common.noImage")}
                  </div>
                )}
              </div>

              <p className="guessr-hint">
                {t("guessr.hintPrefix")} {hintText || t("guessr.noExtraHints")}
              </p>

              <div
                className="guessr-options"
                role="listbox"
                aria-label={t("guessr.answerOptionsLabel")}
              >
                {options.map((option) => {
                  const isSelected = selectedOptionId === option.mal_id;
                  const isCorrect = hasAnswered && option.mal_id === correctId;
                  const isWrong =
                    hasAnswered && isSelected && option.mal_id !== correctId;

                  return (
                    <button
                      key={option.mal_id}
                      type="button"
                      onClick={() => handleOptionClick(option.mal_id)}
                      disabled={hasAnswered}
                      className={[
                        "guessr-option",
                        isCorrect ? "correct" : "",
                        isWrong ? "wrong" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {option.title}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && currentAnime && (
                <div className="guessr-result">
                  <strong>
                    {isCorrectAnswer
                      ? t("guessr.correctAnswer")
                      : t("guessr.incorrectAnswer")}
                  </strong>
                  <p>
                    {t("guessr.correctAnime")} <b>{currentAnime.title}</b>
                  </p>
                </div>
              )}

              <div className="guessr-actions">
                <button
                  type="button"
                  onClick={handleSkipRound}
                  className="ghost"
                >
                  {t("common.skipRound")}
                </button>
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="primary"
                  disabled={!hasAnswered}
                >
                  {t("common.nextRound")}
                </button>
              </div>
            </>
          ) : (
            <>
              <header className="anidle-header">
                <h2>{t("guessr.anidleMode")}</h2>
                <p>{t("guessr.noAttemptLimit")}</p>
              </header>

              {isLoadingAnidleRound ? (
                <p className="guessr-state">{t("guessr.loadingAnidleRound")}</p>
              ) : anidleError ? (
                <div className="guessr-state-wrap">
                  <p className="guessr-state error">{anidleError}</p>
                  <button type="button" onClick={() => void loadAnidleRound()}>
                    {t("common.tryAgain")}
                  </button>
                </div>
              ) : (
                <>
                  <div className="anidle-search-wrap">
                    <div className="anidle-round-actions">
                      <button
                        type="button"
                        className="primary"
                        onClick={handleNextAnidleRound}
                      >
                        {t("common.newRound")}
                      </button>
                    </div>

                    <div className="anidle-input-group">
                      <input
                        type="text"
                        placeholder={t("guessr.typeGuessPlaceholder")}
                        value={anidleQuery}
                        onChange={(event) => setAnidleQuery(event.target.value)}
                        onFocus={() => setIsAnidleSearchFocused(true)}
                        onBlur={() => {
                          window.setTimeout(
                            () => setIsAnidleSearchFocused(false),
                            120,
                          );
                        }}
                        disabled={anidleHasEnded}
                      />

                      {shouldShowAnidleSuggestions && (
                        <div className="anime-suggestions" role="listbox">
                          {isSearchingAnidle && (
                            <p className="search-state">
                              {t("common.searching")}
                            </p>
                          )}

                          {!isSearchingAnidle && anidleError && (
                            <p className="search-state error">{anidleError}</p>
                          )}

                          {!isSearchingAnidle &&
                            !anidleError &&
                            anidleSuggestions.length === 0 && (
                              <p className="search-state">
                                {t("common.noAnimeFound")}
                              </p>
                            )}

                          {!isSearchingAnidle &&
                            !anidleError &&
                            anidleSuggestions.map((anime) => (
                              <button
                                key={anime.mal_id}
                                type="button"
                                className="anime-suggestion-item"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => handleAnidleGuess(anime)}
                              >
                                <span>
                                  <strong>{animeDisplayTitle(anime)}</strong>
                                  <small>
                                    {[
                                      anime.type,
                                      anime.year ? String(anime.year) : null,
                                      anime.episodes
                                        ? t("guessr.epsShort", {
                                            count: anime.episodes,
                                          })
                                        : null,
                                    ]
                                      .filter(Boolean)
                                      .join(" - ") ||
                                      t("common.detailsUnavailable")}
                                  </small>
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="anidle-round-actions">
                      <button
                        type="button"
                        className="ghost"
                        onClick={handleGiveUpAnidleRound}
                        disabled={anidleHasEnded || !anidleTargetAnime}
                      >
                        {t("guessr.giveUpButton")}
                      </button>
                    </div>
                  </div>
                  <div
                    className="anidle-board"
                    role="table"
                    aria-label={t("guessr.boardLabel")}
                  >
                    <div className="anidle-row anidle-head" role="row">
                      <span>{t("guessr.guess")}</span>
                      <span>{t("guessr.type")}</span>
                      <span>{t("guessr.year")}</span>
                      <span>{t("guessr.episodes")}</span>
                      <span>{t("common.score")}</span>
                      <span>{t("guessr.source")}</span>
                    </div>

                    {anidleGuesses.map((guess) => {
                      const hint = anidleTargetAnime
                        ? buildAnidleHint(guess, anidleTargetAnime)
                        : null;

                      return (
                        <div
                          key={guess.mal_id}
                          className="anidle-row"
                          role="row"
                        >
                          <span className="anidle-title">
                            {animeDisplayTitle(guess)}
                          </span>
                          <span
                            className={hintClassName(hint?.type ?? "unknown")}
                          >
                            {formatGuessValue(guess.type)}
                          </span>
                          <span
                            className={hintClassName(hint?.year ?? "unknown")}
                          >
                            {formatGuessValue(guess.year)}
                          </span>
                          <span
                            className={hintClassName(
                              hint?.episodes ?? "unknown",
                            )}
                          >
                            {formatGuessValue(guess.episodes)}
                          </span>
                          <span
                            className={hintClassName(hint?.score ?? "unknown")}
                          >
                            {formatGuessValue(guess.score)}
                          </span>
                          <span
                            className={hintClassName(hint?.source ?? "unknown")}
                          >
                            {formatGuessValue(guess.source)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {anidleHasEnded && anidleTargetAnime && (
                    <div className="guessr-result">
                      <strong>
                        {anidleSolved
                          ? t("guessr.solved")
                          : anidleGaveUp
                            ? t("guessr.gaveUp")
                            : t("guessr.roundEnded")}
                      </strong>
                      <p>
                        {t("guessr.hiddenAnime")} <b>{anidleTargetTitle}</b>
                      </p>
                    </div>
                  )}

                  {anidleGaveUp && anidleTargetAnime && (
                    <div
                      className="anidle-modal-backdrop"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="anidle-giveup-title"
                    >
                      <div className="anidle-modal">
                        <h3 id="anidle-giveup-title">
                          {t("guessr.giveUpTitle")}
                        </h3>
                        <p>
                          {t("guessr.giveUpReveal")} <b>{anidleTargetTitle}</b>
                        </p>

                        <div className="anidle-modal-content">
                          <div className="anidle-modal-cover-wrap">
                            {anidleCoverUrl ? (
                              <img
                                src={anidleCoverUrl}
                                alt={t("guessr.revealedCoverAlt")}
                                className="anidle-modal-cover"
                              />
                            ) : (
                              <div className="anidle-modal-cover-fallback">
                                {t("common.noImage")}
                              </div>
                            )}
                          </div>

                          <dl className="anidle-modal-meta">
                            <div>
                              <dt>{t("guessr.type")}</dt>
                              <dd>
                                {formatGuessValue(anidleTargetAnime.type)}
                              </dd>
                            </div>
                            <div>
                              <dt>{t("guessr.year")}</dt>
                              <dd>
                                {formatGuessValue(anidleTargetAnime.year)}
                              </dd>
                            </div>
                            <div>
                              <dt>{t("guessr.episodes")}</dt>
                              <dd>
                                {formatGuessValue(anidleTargetAnime.episodes)}
                              </dd>
                            </div>
                            <div>
                              <dt>{t("common.score")}</dt>
                              <dd>
                                {formatScoreValue(anidleTargetAnime.score)}
                              </dd>
                            </div>
                            <div>
                              <dt>{t("guessr.source")}</dt>
                              <dd>
                                {formatGuessValue(anidleTargetAnime.source)}
                              </dd>
                            </div>
                            <div>
                              <dt>{t("guessr.status")}</dt>
                              <dd>
                                {formatGuessValue(anidleTargetAnime.status)}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="anidle-modal-actions">
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => setAnidleGaveUp(false)}
                          >
                            {t("common.close")}
                          </button>
                          <button
                            type="button"
                            className="primary"
                            onClick={handleNextAnidleRound}
                          >
                            {t("common.newRound")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>

        <aside className="guessr-side">
          {mode === "anidle" && (
            <section className="anidle-hints" aria-live="polite">
              <div className="anidle-hints-header">
                <div>
                  <h3>{t("guessr.hintsTitle")}</h3>
                  <p>
                    {t("guessr.hintsSubtitle", {
                      revealed: anidleRevealedHints,
                      total: anidleMaxHints,
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  className="ghost"
                  onClick={handleRevealAnidleHint}
                  disabled={
                    !anidleTargetAnime ||
                    anidleHasEnded ||
                    anidleRevealedHints >= anidleMaxHints
                  }
                >
                  {anidleRevealedHints >= anidleMaxHints
                    ? t("guessr.allHintsRevealed")
                    : t("guessr.revealHintButton")}
                </button>
              </div>

              <div className="anidle-hints-list">
                {anidleRevealedHints === 0 && (
                  <p className="anidle-hints-empty">
                    {t("guessr.hintsHiddenState")}
                  </p>
                )}

                {anidleRevealedHints >= 1 && (
                  <article className="anidle-hint-card">
                    <h4>{t("guessr.coverHintLabel")}</h4>
                    {anidleCoverUrl ? (
                      <img
                        src={anidleCoverUrl}
                        alt={t("guessr.posterClueAlt")}
                        className="anidle-hint-cover"
                      />
                    ) : (
                      <p>{t("common.noImage")}</p>
                    )}
                  </article>
                )}

                {anidleRevealedHints >= 2 && (
                  <article className="anidle-hint-card">
                    <h4>{t("guessr.descriptionHintLabel")}</h4>
                    <p>
                      {anidleTargetAnime?.synopsis?.trim() ||
                        t("guessr.noDescriptionHint")}
                    </p>
                  </article>
                )}
              </div>
            </section>
          )}

          <section className="guessr-side-card">
            <h2>{t("guessr.howItWorks")}</h2>
            {mode === "classic" ? (
              <ul>
                <li>{t("guessr.classicRule1")}</li>
                <li>{t("guessr.classicRule2")}</li>
                <li>{t("guessr.classicRule3")}</li>
              </ul>
            ) : (
              <ul>
                <li>{t("guessr.anidleRule1")}</li>
                <li>{t("guessr.anidleRule2")}</li>
                <li>{t("guessr.anidleRule3")}</li>
              </ul>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
