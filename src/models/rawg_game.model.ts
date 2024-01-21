/* eslint-disable @typescript-eslint/no-explicit-any  */

export interface RAWGListResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface RAWGGameFromSearch {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: RAWGRating;
  rating_top: number;
  ratings: RAWGRating[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: RAWGAddedByStatus;
  metacritic: number;
  playtime: number; // in hours
  suggestions_count: number;
  updated: string;
  esrb_rating?: RAWGESRBRating;
  platforms: RAWGPlatform[];
  stores: RAWGStore[];
  score: number;
  tags: RAWGTag[];
  saturated_color: string; // hex value w/o '#'
  dominant_color: string; // hex value w/o '#'
  genres: RAWGGenre[];
  parent_platforms: RAWGPlatform[];
  short_screenshots: RAWGScreenShot[];
}

export interface RAWGGame {
  id: number;
  slug: string;
  name: string;
  name_original: string;
  description: string;
  metacritic: number;
  metacritic_platforms: RAWGMetacriticPlatform[];
  released: string;
  tba: boolean;
  updated: string;
  background_image: string;
  background_image_additional: string;
  website: string;
  rating: number;
  rating_top: number;
  ratings: RAWGRating[];
  reactions: { [key: string]: number };
  added: number;
  added_by_status: RAWGAddedByStatus;
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
  parent_platforms: RAWGPlatform[];
  platforms: RAWGPlatformDetailed[];
  stores: RAWGStoreDetailed[];
  developers: RAWGDeveloper[];
  genres: RAWGGenre[];
  tags: RAWGTag[];
  publishers: RAWGPublisher[];
  esrb_rating: RAWGESRBRating;
  description_raw: string;
}

export const releaseYearForRAWGGame = (game: RAWGGameFromSearch | RAWGGame): string => {
  const releaseString = game.released;
  return releaseString.substring(0, releaseString.indexOf('-'));
};

export interface RAWGMetacriticPlatform {
  metascore: number;
  url: string;
  platform: RAWGPlatform;
}

export interface RAWGPlatform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface RAWGPlatformDetailed {
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

interface RAWGStore {
  id: number;
  name: string;
  slug: string;
}

interface RAWGStoreDetailed {
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

export interface RAWGDeveloper {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

interface RAWGRating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

interface RAWGAddedByStatus {
  beaten: number;
  dropped: number;
  owned: number;
  playing: number;
  toplay: number;
  yet: number;
}

export interface RAWGTag {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
  image_background: string;
}

interface RAWGESRBRating {
  id: number;
  name: string;
  slug: string;
  name_en?: string;
  name_ru?: string;
}

interface RAWGScreenShot {
  id: number;
  image: string;
}

export interface RAWGGenre {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: number;
}

export interface RAWGPublisher {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}
