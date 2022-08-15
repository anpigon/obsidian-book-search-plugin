import { Book } from '@models/book.model';
import { BaseBooksApi } from './base_api';
import { NaverBookItem, NaverBooksResponse } from './models/naver_books_response';

export class NaverBooksApi extends BaseBooksApi {
  private readonly API_URL = 'https://openapi.naver.com/v1/search/book.json';

  constructor(private readonly clientId, private readonly clientSecret: string) {
    super();
  }

  async getByQuery(query: string) {
    try {
      const params = {
        q: query,
        display: 50,
        sort: 'sim',
      };
      const langRestrict = window.moment.locale();
      if (langRestrict) {
        params['langRestrict'] = langRestrict;
      }
      const header = {
        'X-Naver-Client-Id': this.clientId,
        'X-Naver-Client-Secret': this.clientSecret,
      };
      const searchResults = await super.apiGet<NaverBooksResponse>(this.API_URL, params, header);
      if (searchResults.total == 0) {
        throw new Error('No results found.');
      }
      return searchResults.items.map(this.formatForSuggestion);
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  formatForSuggestion(item: NaverBookItem): Book {
    const book: Book = {
      title: item.title,
      author: item.author,
      publisher: item.publisher,
      coverUrl: item.image,
      publishDate: item.pubdate ? `${new Date(item.pubdate).getFullYear()}` : '',
      link: item.link,
      description: item.description,
      isbn: item.isbn,
      ...(item.isbn?.length >= 13 ? { isbn13: item.isbn } : { isbn10: item.isbn }),
    };
    return book;
  }
}
