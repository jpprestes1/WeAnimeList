const JIKAN_BASE_URL = "https://api.jikan.moe/v4";
import type {
  AnimeSummary,
  CharacterSummary,
  Genre,
  JikanResponse,
  ListQueryParams,
  MangaSummary,
  RecommendationEntry,
  SearchAnimeParams,
  SearchMangaParams,
} from "../interfaces/jikan";

export type {
  AnimeSummary,
  CharacterSummary,
  Genre,
  JikanPagination,
  JikanResponse,
  ListQueryParams,
  MangaSummary,
  RecommendationEntry,
  SearchAnimeParams,
  SearchMangaParams,
} from "../interfaces/jikan";

function buildQueryString(params?: object): string {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number") {
      if (value !== "") {
        searchParams.set(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

async function jikanFetch<T>(
  endpoint: string,
  params?: object,
): Promise<JikanResponse<T>> {
  const query = buildQueryString(params);
  const url = `${JIKAN_BASE_URL}${endpoint}${query}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Jikan API error: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as JikanResponse<T>;
}

export async function searchAnime(
  params: SearchAnimeParams,
): Promise<JikanResponse<AnimeSummary[]>> {
  return jikanFetch<AnimeSummary[]>("/anime", params);
}

export async function getAnimeById(
  animeId: number,
): Promise<JikanResponse<AnimeSummary>> {
  return jikanFetch<AnimeSummary>(`/anime/${animeId}/full`);
}

export async function getTopAnime(
  params?: ListQueryParams,
): Promise<JikanResponse<AnimeSummary[]>> {
  return jikanFetch<AnimeSummary[]>("/top/anime", params);
}

export async function getCurrentSeasonAnime(
  params?: ListQueryParams,
): Promise<JikanResponse<AnimeSummary[]>> {
  return jikanFetch<AnimeSummary[]>("/seasons/now", params);
}

export async function getSeasonAnime(
  year: number,
  season: "winter" | "spring" | "summer" | "fall",
  params?: ListQueryParams,
): Promise<JikanResponse<AnimeSummary[]>> {
  return jikanFetch<AnimeSummary[]>(`/seasons/${year}/${season}`, params);
}

export async function getAnimeRecommendations(
  params?: ListQueryParams,
): Promise<JikanResponse<RecommendationEntry[]>> {
  return jikanFetch<RecommendationEntry[]>("/recommendations/anime", params);
}

export async function getAnimeCharacters(
  animeId: number,
): Promise<JikanResponse<{ character: CharacterSummary }[]>> {
  return jikanFetch<{ character: CharacterSummary }[]>(
    `/anime/${animeId}/characters`,
  );
}

export async function searchManga(
  params: SearchMangaParams,
): Promise<JikanResponse<MangaSummary[]>> {
  return jikanFetch<MangaSummary[]>("/manga", params);
}

export async function getTopManga(
  params?: ListQueryParams,
): Promise<JikanResponse<MangaSummary[]>> {
  return jikanFetch<MangaSummary[]>("/top/manga", params);
}

export async function getAnimeGenres(): Promise<JikanResponse<Genre[]>> {
  return jikanFetch<Genre[]>("/genres/anime");
}

export async function getRandomAnime(): Promise<JikanResponse<AnimeSummary>> {
  return jikanFetch<AnimeSummary>("/random/anime");
}
