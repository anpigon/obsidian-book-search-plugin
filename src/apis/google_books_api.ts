import { Book } from '@models/book.model';
import { GoogleBooksResponse, VolumeInfo } from './models/google_books.model';
import { BaseBooksApi } from './base_api';
export class GoogleBooksApi extends BaseBooksApi {
  private readonly API_URL = 'https://www.googleapis.com/books/v1/volumes';

  async getByQuery(query: string) {
    try {
      const params = {
        q: query,
        maxResults: 40,
        printType: 'books',
      };
      const langRestrict = window.moment.locale();
      if (langRestrict) {
        params['langRestrict'] = langRestrict;
      }
      const searchResults = await super.apiGet<GoogleBooksResponse>(this.API_URL, params);
      if (searchResults.totalItems == 0) {
        throw new Error('No results found.');
      }
      return searchResults.items.map(({ volumeInfo }) => this.formatForSuggestion(volumeInfo));
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  getISBN(item: VolumeInfo) {
    let ISBN10 = '';
    let ISBN13 = '';
    let isbn10_data, isbn13_data;

    if (item.industryIdentifiers) {
      isbn10_data = item.industryIdentifiers.find(element => element.type == 'ISBN_10');
      isbn13_data = item.industryIdentifiers.find(element => element.type == 'ISBN_13');
    }

    if (isbn10_data) ISBN10 = isbn10_data.identifier.trim();
    if (isbn13_data) ISBN13 = isbn13_data.identifier.trim();

    return { ISBN10, ISBN13 };
  }

  formatForSuggestion(item: VolumeInfo): Book {
    const ISBN = this.getISBN(item);
    const book: Book = {
      title: item.title,
      author: this.formatList(item.authors),
      category: this.formatList(item.categories),
      publisher: item.publisher,
      totalPage: item.pageCount,
      coverUrl: `${item.imageLinks?.thumbnail ?? ''}`.replace('http:', 'https:'),
      publishDate: item.publishedDate ? `${new Date(item.publishedDate).getFullYear()}` : '',
      isbn10: ISBN.ISBN10,
      isbn13: ISBN.ISBN13,
    };
    return book;
  }

  formatList(list?: string[]) {
    if (!list || list.length === 0 || list[0] == 'N/A') return '';
    if (list.length === 1) return list[0] ?? '';

    return list.map(item => `${item.trim()}`).join(', ');
  }
}
