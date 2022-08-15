import { Book } from '@models/book.model';
import { BookSearchPluginSettings } from '@settings/settings';
import { ServiceProvider } from '@src/constants';
import { request } from 'obsidian';
import { GoogleBooksApi } from './google_books_api';
import { NaverBooksApi } from './naver_books_api';

export interface BaseBooksApiImpl {
  getByQuery(query: string): Promise<Book[]>;
}

export function getServiceProvider(settings: BookSearchPluginSettings): BaseBooksApiImpl {
  if (settings.serviceProvider === ServiceProvider.google) {
    return new GoogleBooksApi();
  }
  if (settings.serviceProvider === ServiceProvider.naver) {
    return new NaverBooksApi(settings.naverClientId, settings.naverClientSecret);
  }
}

export class BaseBooksApi implements BaseBooksApiImpl {
  getByQuery(_query: string): Promise<Book[]> {
    throw new Error('Method not implemented.');
  }

  async apiGet<T>(
    url: string,
    params: Record<string, string | number> = {},
    headers?: Record<string, string>,
  ): Promise<T> {
    const apiURL = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      apiURL.searchParams.append(key, value?.toString());
    });
    const res = await request({
      url: apiURL.href,
      method: 'GET',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json; charset=utf-8',
        ...headers,
      },
    });
    return JSON.parse(res) as T;
  }
}
