import { apiGet, BaseBooksApiImpl } from '@apis/base_api';
import { Book } from '@models/book.model';
import { GoogleBooksResponse, VolumeInfo } from './models/google_books_response';

export class GoogleBooksApi implements BaseBooksApiImpl {
  private static readonly MAX_RESULTS = 40;
  private static readonly PRINT_TYPE = 'books';

  constructor(private readonly localePreference: string, private readonly apiKey?: string) {}

  private getLanguageRestriction(): string {
    return this.localePreference === 'default' ? window.moment.locale() : this.localePreference;
  }

  private buildSearchParams(query: string, options?: any): Record<string, string | number> {
    const params: Record<string, string | number> = {
      q: query,
      maxResults: GoogleBooksApi.MAX_RESULTS,
      printType: GoogleBooksApi.PRINT_TYPE,
      langRestrict: options?.locale || this.getLanguageRestriction(),
    };

    if (this.apiKey) {
      params['key'] = this.apiKey;
    }

    return params;
  }

  async getByQuery(query: string, options?: any): Promise<Book[]> {
    try {
      const params = this.buildSearchParams(query, options);
      const searchResults = await apiGet<GoogleBooksResponse>('https://www.googleapis.com/books/v1/volumes', params);
      if (!searchResults?.totalItems) {
        return [];
      }
      return searchResults.items.map(({ volumeInfo }) => this.createBookItem(volumeInfo));
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  private getISBN(industryIdentifiers: VolumeInfo['industryIdentifiers']) {
    return industryIdentifiers?.reduce((result, item) => {
      const isbnType = item.type === 'ISBN_10' ? 'isbn10' : 'isbn13';
      result[isbnType] = item.identifier.trim();
      return result;
    }, {} as Record<string, string>);
  }

  private extractBasicBookInfo(item: VolumeInfo): Partial<Book> {
    return {
      title: item.title,
      subtitle: item.subtitle,
      author: this.formatList(item.authors),
      authors: item.authors,
      category: this.formatList(item.categories),
      categories: item.categories,
      publisher: item.publisher,
      totalPage: item.pageCount,
      coverUrl: item.imageLinks?.thumbnail ?? '',
      coverSmallUrl: item.imageLinks?.smallThumbnail ?? '',
      publishDate: item.publishedDate || '',
      description: item.description,
      link: item.canonicalVolumeLink || item.infoLink,
      previewLink: item.previewLink,
    };
  }

  public createBookItem(item: VolumeInfo): Book {
    const book: Book = {
      title: '',
      subtitle: '',
      author: '',
      authors: [],
      category: '',
      categories: [],
      publisher: '',
      publishDate: '',
      totalPage: '',
      coverUrl: '',
      coverSmallUrl: '',
      description: '',
      link: '',
      previewLink: '',
      ...this.extractBasicBookInfo(item),
      ...this.getISBN(item.industryIdentifiers),
    };
    return book;
  }

  public formatList(list?: string[]): string {
    return list && list.length > 1 ? list.map(item => item.trim()).join(', ') : list?.[0] ?? '';
  }

  static convertGoogleBookImageURLSize(url: string, zoom: number) {
    return url.replace(/(&zoom)=\d/, `$1=${zoom}`);
  }
}
