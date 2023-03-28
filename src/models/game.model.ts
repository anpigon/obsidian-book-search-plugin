/* eslint-disable @typescript-eslint/no-explicit-any  */

export interface RAWGResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface Game {
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
  releaseYear(): string;
}

export const releaseYearForGame = (game: Game): string => {
  const releaseString = game.released;
  return releaseString.substring(0, releaseString.indexOf('-'));
};

export interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Store {
  id: number;
  name: string;
  slug: string;
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
  name_en: string;
  name_ru: string;
}

interface ScreenShot {
  id: number;
  image: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}
