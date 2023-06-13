/* eslint-disable @typescript-eslint/no-explicit-any  */

export interface RAWGListResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface GameFromSearch {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: Rating;
  rating_top: number;
  ratings: Rating[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: AddedByStatus;
  metacritic: number;
  playtime: number; // in hours
  suggestions_count: number;
  updated: string;
  esrb_rating?: ESRBRating;
  platforms: Platform[];
  stores: Store[];
  score: number;
  tags: Tag[];
  saturated_color: string; // hex value w/o '#'
  dominant_color: string; // hex value w/o '#'
  genres: Genre[];
  parent_platforms: Platform[];
  short_screenshots: ScreenShot[];
}

export interface Game {
  id: number;
  slug: string;
  name: string;
  name_original: string;
  description: string;
  metacritic: number;
  metacritic_platforms: MetacriticPlatform[];
  released: string;
  tba: boolean;
  updated: string;
  background_image: string;
  background_image_additional: string;
  website: string;
  rating: number;
  rating_top: number;
  ratings: Rating[];
  reactions: { [key: string]: number };
  added: number;
  added_by_status: AddedByStatus;
  playtime: number;
  screenshots_count: number;
  movies_count: number;
  creators_count: number;
  achievements_count: number;
  parent_achievements_count: number;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  reviews_text_count: number;
  ratings_count: number;
  suggestions_count: number;
  alternative_names: string[];
  metacritic_url: string;
  parents_count: number;
  additions_count: number;
  game_series_count: number;
  user_game: null;
  reviews_count: number;
  saturated_color: string; // note: hex color without '#'
  dominant_color: string; // note: hex colot without '#'
  parent_platforms: Platform[];
  platforms: PlatformDetailed[];
  stores: StoreDetailed[];
  developers: Developer[];
  genres: Genre[];
  tags: Tag[];
  publishers: Publisher[];
  esrb_rating: ESRBRating;
  description_raw: string;
}

export const releaseYearForGame = (game: GameFromSearch | Game): string => {
  const releaseString = game.released;
  return releaseString.substring(0, releaseString.indexOf('-'));
};

export interface MetacriticPlatform {
  metascore: number;
  url: string;
  platform: Platform;
}

export interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface PlatformDetailed {
  platform: {
    id: number;
    name: string;
    slug: string;
    image?: string;
    year_end?: string;
    year_start?: string;
    games_count: number;
    image_background: string;
  };
  released_at: string;
}

interface Store {
  id: number;
  name: string;
  slug: string;
}

interface StoreDetailed {
  id: number;
  url: string;
  store: {
    id: number;
    name: string;
    slug: string;
    domain: string;
    games_count: number;
    image_background: string;
  };
}

export interface Developer {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

interface Rating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

interface AddedByStatus {
  beaten: number;
  dropped: number;
  owned: number;
  playing: number;
  toplay: number;
  yet: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
  image_background: string;
}

interface ESRBRating {
  id: number;
  name: string;
  slug: string;
  name_en?: string;
  name_ru?: string;
}

interface ScreenShot {
  id: number;
  image: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: number;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}
