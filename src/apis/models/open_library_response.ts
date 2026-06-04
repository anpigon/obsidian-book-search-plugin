export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryDoc[];
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  isbn?: string[];
  publisher?: string[];
  publish_year?: number[];
  subject?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  first_publish_year?: number;
  language?: string[];
}
