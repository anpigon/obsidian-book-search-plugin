import { Book } from '@models/book.model';
import { apiGet, BaseBooksApiImpl } from '@apis/base_api';
import { GoogleBooksResponse, VolumeInfo } from './models/google_books_response';

export class GoogleBooksApi implements BaseBooksApiImpl {
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
      const searchResults = await apiGet<GoogleBooksResponse>('https://www.googleapis.com/books/v1/volumes', params);
      if (searchResults.totalItems == 0) {
        throw new Error('No results found.');
      }
      return searchResults.items.map(({ volumeInfo }) => this.createBookItem(volumeInfo));
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  getISBN(industryIdentifiers: VolumeInfo['industryIdentifiers']) {
    return industryIdentifiers?.reduce((result, item) => {
      if (item.type == 'ISBN_10') {
        result['isbn10'] = item.identifier.trim();
      }
      if (item.type == 'ISBN_13') {
        result['isbn13'] = item.identifier.trim();
      }
      return result;
    }, {});
  }

  createBookItem(item: VolumeInfo): Book {
    const book: Book = {
      title: item.title,
      author: this.formatList(item.authors),
      category: this.formatList(item.categories),
      publisher: item.publisher,
      totalPage: item.pageCount,
      coverUrl: `${item.imageLinks?.thumbnail ?? ''}`.replace('http:', 'https:'),
      publishDate: item.publishedDate ? `${new Date(item.publishedDate).getFullYear()}` : '',
      ...this.getISBN(item.industryIdentifiers),
    };
    return book;
  }

  formatList(list?: string[]) {
    if (list?.length > 1) {
      return list.map(item => `${item.trim()}`).join(', ');
    }
    return list?.[0]?.replace('N/A', '') ?? '';
  }
}
