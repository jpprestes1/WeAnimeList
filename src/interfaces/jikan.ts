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
  source?: string | null;
  synopsis?: string | null;
  score?: number | null;
  episodes?: number | null;
  status?: string;
  year?: number | null;
  season?: string | null;
  producers?: {
    mal_id: number;
    name: string;
    type?: string;
    url?: string;
  }[];
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
