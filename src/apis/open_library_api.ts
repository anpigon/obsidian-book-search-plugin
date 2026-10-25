import { apiGet, BaseBooksApiImpl } from '@apis/base_api';
import { Book } from '@models/book.model';
import {
  OpenLibraryEdition,
  OpenLibrarySearchResponse,
  OpenLibraryWork,
  OpenLibraryWorkDetails,
} from './models/open_library_response';

export class OpenLibraryApi implements BaseBooksApiImpl {
  private static readonly BASE_URL = 'https://openlibrary.org';
  private static readonly COVERS_URL = 'https://covers.openlibrary.org/b/id';
  private static readonly MAX_RESULTS = 40;
  private static readonly FIELDS = [
    'key',
    'title',
    'subtitle',
    'author_name',
    'publisher',
    'first_publish_year',
    'number_of_pages_median',
    'isbn',
    'cover_i',
    'subject',
    'editions',
    'editions.key',
    'editions.title',
    'editions.subtitle',
    'editions.publisher',
    'editions.publish_date',
    'editions.number_of_pages',
    'editions.isbn',
    'editions.cover_i',
  ].join(',');

  constructor(private readonly localePreference: string) {}

  // Open Library expects ISO 639-1 codes, while moment locales can be region specific (e.g. "pt-br")
  private getLanguage(locale: string): string {
    return (locale === 'default' ? window.moment.locale() : locale).split('-')[0];
  }

  async getByQuery(query: string, options?: Record<string, string>): Promise<Book[]> {
    try {
      const params = {
        q: query,
        fields: OpenLibraryApi.FIELDS,
        limit: OpenLibraryApi.MAX_RESULTS,
        lang: this.getLanguage(options?.locale || this.localePreference),
      };
      const searchResults = await apiGet<OpenLibrarySearchResponse>(`${OpenLibraryApi.BASE_URL}/search.json`, params);
      if (!searchResults?.numFound) return [];
      return searchResults.docs.map(work => this.createBookItem(work));
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  // Search results don't include descriptions, so fetch them from the work only for the selected book
  async getBookDetails(book: Book): Promise<Book> {
    if (!book.link?.startsWith(`${OpenLibraryApi.BASE_URL}/works/`)) return book;
    try {
      const work = await apiGet<OpenLibraryWorkDetails>(`${book.link}.json`);
      const description = typeof work?.description === 'string' ? work.description : work?.description?.value;
      return { ...book, description: description ?? book.description };
    } catch (error) {
      console.warn(error);
      return book;
    }
  }

  public createBookItem(work: OpenLibraryWork): Book {
    // The edition that best matches the query and language, if any
    const edition: OpenLibraryEdition | undefined = work.editions?.docs?.[0];
    const authors = work.author_name ?? [];
    const coverId = edition?.cover_i ?? work.cover_i;
    // Work ISBNs span all editions, so only fall back to them when no edition was matched
    const isbns = (edition ? edition.isbn : work.isbn)?.map(isbn => isbn.replace(/[\s-]/g, '')) ?? [];

    return {
      title: edition?.title ?? work.title,
      subtitle: edition?.subtitle ?? work.subtitle ?? '',
      author: this.formatList(authors),
      authors,
      category: this.formatList(work.subject?.slice(0, 3)),
      categories: work.subject ?? [],
      publisher: edition?.publisher?.[0] ?? work.publisher?.[0] ?? '',
      publishDate: edition?.publish_date?.[0] ?? work.first_publish_year?.toString() ?? '',
      totalPage: edition?.number_of_pages ?? work.number_of_pages_median ?? '',
      coverUrl: this.getCoverUrl(coverId, 'M'),
      coverSmallUrl: this.getCoverUrl(coverId, 'S'),
      coverMediumUrl: this.getCoverUrl(coverId, 'M'),
      coverLargeUrl: this.getCoverUrl(coverId, 'L'),
      description: '',
      link: `${OpenLibraryApi.BASE_URL}${work.key}`,
      previewLink: edition?.key ? `${OpenLibraryApi.BASE_URL}${edition.key}` : '',
      isbn10: isbns.find(isbn => isbn.length === 10) ?? '',
      isbn13: isbns.find(isbn => isbn.length === 13) ?? '',
    };
  }

  private getCoverUrl(coverId: number | undefined, size: 'S' | 'M' | 'L'): string {
    return coverId ? `${OpenLibraryApi.COVERS_URL}/${coverId}-${size}.jpg` : '';
  }

  private formatList(list?: string[]): string {
    return list?.map(item => item.trim()).join(', ') ?? '';
  }
}
