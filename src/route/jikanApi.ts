const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

export interface JikanPagination {
  current_page: number;
  has_next_page: boolean;
  items?: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: JikanPagination;
}

export interface AnimeSummary {
  mal_id: number;
  title: string;
  title_english?: string | null;
  type?: string | null;
  synopsis?: string | null;
  score?: number | null;
  episodes?: number | null;
  status?: string;
  year?: number | null;
  season?: string | null;
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
    };
    webp?: {
      image_url?: string;
      large_image_url?: string;
    };
  };
}

export interface MangaSummary {
  mal_id: number;
  title: string;
  title_english?: string | null;
  synopsis?: string | null;
  score?: number | null;
  chapters?: number | null;
  status?: string;
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
    };
    webp?: {
      image_url?: string;
      large_image_url?: string;
    };
  };
}

export interface CharacterSummary {
  mal_id: number;
  name: string;
  images?: {
    jpg?: {
      image_url?: string;
    };
    webp?: {
      image_url?: string;
    };
  };
}

export interface Genre {
  mal_id: number;
  name: string;
  type: string;
}

export interface RecommendationEntry {
  mal_id: string;
  entry: AnimeSummary[];
  content?: string;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
}

export interface SearchAnimeParams extends ListQueryParams {
  q: string;
  type?: "tv" | "movie" | "ova" | "special" | "ona" | "music";
  status?: "airing" | "complete" | "upcoming";
  order_by?:
    | "mal_id"
    | "title"
    | "start_date"
    | "end_date"
    | "episodes"
    | "score"
    | "scored_by"
    | "rank"
    | "popularity"
    | "members"
    | "favorites";
  sort?: "desc" | "asc";
  min_score?: number;
  max_score?: number;
}

export interface SearchMangaParams extends ListQueryParams {
  q: string;
  type?:
    | "manga"
    | "novel"
    | "lightnovel"
    | "oneshot"
    | "doujin"
    | "manhwa"
    | "manhua";
  status?: "publishing" | "complete" | "hiatus" | "discontinued" | "upcoming";
  order_by?:
    | "mal_id"
    | "title"
    | "start_date"
    | "end_date"
    | "chapters"
    | "volumes"
    | "score"
    | "scored_by"
    | "rank"
    | "popularity"
    | "members"
    | "favorites";
  sort?: "desc" | "asc";
  min_score?: number;
  max_score?: number;
}

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
