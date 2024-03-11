import { Book } from '@models/book.model';
import { BookSearchPluginSettings } from '@settings/settings';
import { ServiceProvider } from '@src/constants';
import { requestUrl } from 'obsidian';
import { GoogleBooksApi } from './google_books_api';
import { NaverBooksApi } from './naver_books_api';

export interface BaseBooksApiImpl {
  getByQuery(query: string, options?: Record<string, string>): Promise<Book[]>;
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function factoryServiceProvider(settings: BookSearchPluginSettings): BaseBooksApiImpl {
  switch (settings.serviceProvider) {
    case ServiceProvider.google:
      return new GoogleBooksApi(settings.localePreference, settings.apiKey);
    case ServiceProvider.naver:
      validateNaverSettings(settings);
      return new NaverBooksApi(settings.naverClientId, settings.naverClientSecret);
    default:
      throw new Error('Unsupported service provider.');
  }
}

function validateNaverSettings(settings: BookSearchPluginSettings): void {
  if (!settings.naverClientId || !settings.naverClientSecret) {
    throw new ConfigurationError('네이버 개발자센터에서 "Client ID"와 "Client Secret"를 발급받아 설정해주세요.');
  }
}

export async function apiGet<T>(
  url: string,
  params: Record<string, string | number> = {},
  headers?: Record<string, string>,
): Promise<T> {
  const apiURL = new URL(url);
  appendQueryParams(apiURL, params);

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

function appendQueryParams(url: URL, params: Record<string, string | number>): void {
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
}
