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
  ratings: any[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: any;
  metacritic: number;
  playtime: number; // in hours
  suggestions_count: number;
  updated: string;
  esrb_rating?: any;
  platforms: any[];
  stores: any[];
  score: number;
  tags: any[];
  saturated_color: string; // hex value w/o '#'
  dominant_color: string; // hex value w/o '#'
  genres: any[];
  parent_platforms: any[];
  short_screenshots: any[];
}
