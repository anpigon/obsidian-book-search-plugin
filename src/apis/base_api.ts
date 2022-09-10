import { Book } from '@models/book.model';
import { BookSearchPluginSettings } from '@settings/settings';
import { ServiceProvider } from '@src/constants';
import { requestUrl } from 'obsidian';
import { GoogleBooksApi } from './google_books_api';
import { NaverBooksApi } from './naver_books_api';

export interface BaseBooksApiImpl {
  getByQuery(query: string): Promise<Book[]>;
}

export function factoryServiceProvider(settings: BookSearchPluginSettings): BaseBooksApiImpl {
  if (settings.serviceProvider === ServiceProvider.google) {
    return new GoogleBooksApi(settings.localePreference);
  }
  if (settings.serviceProvider === ServiceProvider.naver) {
    if (!settings.naverClientId || !settings.naverClientSecret) {
      // TODO: Let's create a custom error class
      throw new Error('네이버 개발자센터에서 "Client ID"와 "Client Secret"를 발급받아 설정해주세요.');
    }
    return new NaverBooksApi(settings.naverClientId, settings.naverClientSecret);
  }
}

export async function apiGet<T>(
  url: string,
  params: Record<string, string | number> = {},
  headers?: Record<string, string>,
): Promise<T> {
  const apiURL = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    apiURL.searchParams.append(key, value?.toString());
  });
  const res = await requestUrl({
    url: apiURL.href,
    method: 'GET',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
  return res.json as T;
}
