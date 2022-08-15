// To parse this data:
//
//   import { Convert, NaverBooksResponse } from "./file";
//
//   const naverBooksResponse = Convert.toNaverBooksResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface NaverBooksResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverBookItem[];
}

export interface NaverBookItem {
  title: string;
  link: string;
  image: string;
  author: string;
  discount: string;
  publisher: string;
  pubdate: string;
  isbn: string;
  description: string;
}
