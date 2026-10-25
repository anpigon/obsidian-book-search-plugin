export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryWork[];
}

export interface OpenLibraryWork {
  key: string; // e.g. "/works/OL278571W"
  title: string;
  subtitle?: string;
  author_name?: string[];
  publisher?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  isbn?: string[];
  cover_i?: number;
  subject?: string[];
  editions?: {
    numFound: number;
    docs: OpenLibraryEdition[];
  };
}

export interface OpenLibraryEdition {
  key: string; // e.g. "/books/OL24266006M"
  title?: string;
  subtitle?: string;
  publisher?: string[];
  publish_date?: string[];
  number_of_pages?: number;
  isbn?: string[];
  cover_i?: number;
}

export interface OpenLibraryWorkDetails {
  key: string;
  description?: string | { type: string; value: string };
}
