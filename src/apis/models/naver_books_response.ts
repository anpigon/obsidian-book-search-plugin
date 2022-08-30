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
