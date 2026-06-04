import { apiGet, BaseBooksApiImpl } from '@apis/base_api';
import { Book } from '@models/book.model';
import { GoogleBooksResponse, VolumeInfo } from './models/google_books_response';

const ISBN_RE = /^(97[89])?\d{9}[\dX]$/i;

export class GoogleBooksApi implements BaseBooksApiImpl {
  private static readonly MAX_RESULTS = 40;
  private static readonly PRINT_TYPE = 'books';

  constructor(
    private readonly localePreference: string,
    private readonly enableCoverImageEdgeCurl: boolean,
    private readonly apiKey?: string,
  ) {}

  private getLanguageRestriction(locale: string): string | null {
    if (locale === 'default') return null;
    // Normalize 'en-US' → 'en', 'zh_CN' → 'zh' — Google Books only accepts ISO 639-1
    return locale.split('-')[0].split('_')[0];
  }

  private buildSearchParams(query: string, options?: Record<string, string>): Record<string, string | number> {
    const locale = options?.locale || this.localePreference;
    const langRestrict = this.getLanguageRestriction(locale);
    const cleanQuery = query.replace(/-/g, '');
    const isIsbn = ISBN_RE.test(cleanQuery);

    const params: Record<string, string | number> = {
      maxResults: GoogleBooksApi.MAX_RESULTS,
      printType: GoogleBooksApi.PRINT_TYPE,
    };

    if (isIsbn) {
      // ISBN queries must not have langRestrict — it filters out most results
      params['q'] = `isbn:${cleanQuery}`;
    } else {
      params['q'] = query;
      if (langRestrict) params['langRestrict'] = langRestrict;
    }

    if (this.apiKey) {
      params['key'] = this.apiKey;
    }
    return params;
  }

  async getByQuery(query: string, options?: Record<string, string>): Promise<Book[]> {
    try {
      const params = this.buildSearchParams(query, options);
      const searchResults = await apiGet<GoogleBooksResponse>('https://www.googleapis.com/books/v1/volumes', params);
      if (!searchResults?.totalItems) return [];
      return searchResults.items.map(({ volumeInfo }) => this.createBookItem(volumeInfo));
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  private extractISBNs(industryIdentifiers: VolumeInfo['industryIdentifiers']): Record<string, string> {
    return (
      industryIdentifiers?.reduce(
        (result, item) => {
          const isbnType = item.type === 'ISBN_10' ? 'isbn10' : 'isbn13';
          result[isbnType] = item.identifier.trim();
          return result;
        },
        {} as Record<string, string>,
      ) ?? {}
    );
  }

  private extractCoverUrls(imageLinks: VolumeInfo['imageLinks']): Partial<Book> {
    if (!imageLinks) return {};
    const thumb = this.setCoverImageEdgeCurl(imageLinks.thumbnail ?? '', this.enableCoverImageEdgeCurl);
    const small = this.setCoverImageEdgeCurl(imageLinks.smallThumbnail ?? '', this.enableCoverImageEdgeCurl);
    return {
      coverUrl: thumb,
      coverSmallUrl: small,
      coverMediumUrl: thumb ? GoogleBooksApi.convertGoogleBookImageURLSize(thumb, 2) : '',
      coverLargeUrl: thumb ? GoogleBooksApi.convertGoogleBookImageURLSize(thumb, 0) : '',
    };
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
      ...this.extractCoverUrls(item.imageLinks),
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
      ...this.extractISBNs(item.industryIdentifiers),
    };
    return book;
  }

  public formatList(list?: string[]): string {
    return list && list.length > 1 ? list.map(item => item.trim()).join(', ') : list?.[0] ?? '';
  }

  private setCoverImageEdgeCurl(url: string, enabled: boolean): string {
    // Edge curl is in the URL by default; strip it when disabled
    return enabled ? url : url.replace('&edge=curl', '');
  }

  static convertGoogleBookImageURLSize(url: string, zoom: number): string {
    if (!url) return url;
    if (url.includes('zoom=')) return url.replace(/(&zoom)=\d/, `$1=${zoom}`);
    return `${url}&zoom=${zoom}`;
  }
}
