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
      return new GoogleBooksApi(settings.localePreference, settings.enableCoverImageEdgeCurl, settings.apiKey);
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

const MAX_API_ATTEMPTS = 8;
const API_RETRY_DELAY_MS = 500;
// The Google Books API intermittently fails with 503 (backendFailed) even for
// valid requests, and anonymous requests share a per-IP quota that yields 429.
// Both are transient and usually succeed when retried.
const RETRYABLE_STATUS_CODES = [429, 503];

export async function apiGet<T>(
  url: string,
  params: Record<string, string | number> = {},
  headers?: Record<string, string>,
): Promise<T> {
  const apiURL = new URL(url);
  appendQueryParams(apiURL, params);

  for (let attempt = 1; ; attempt++) {
    const res = await requestUrl({
      url: apiURL.href,
      method: 'GET',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json; charset=utf-8',
        ...headers,
      },
      throw: false,
    });

    if (res.status >= 200 && res.status < 300) {
      return res.json as T;
    }

    if (attempt >= MAX_API_ATTEMPTS || !RETRYABLE_STATUS_CODES.includes(res.status)) {
      throw new Error(`Request failed, status ${res.status}`);
    }

    await sleep(API_RETRY_DELAY_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function appendQueryParams(url: URL, params: Record<string, string | number>): void {
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
}
