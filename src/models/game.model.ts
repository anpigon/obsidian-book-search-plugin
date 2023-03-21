/* eslint-disable @typescript-eslint/no-explicit-any  */

export interface FrontMatter {
  [key: string]: string | string[];
}

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
  rating: number;
  rating_top: number;
  ratings: any;
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: number;
  metacritic: number;
  playtime: number; // in hours
  suggestions_count: number;
  updated: string;
  esrb_rating?: string;
  platforms: any[];
}
