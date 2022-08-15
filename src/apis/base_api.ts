import { Book } from '@models/book.model';
import { request } from 'obsidian';

export interface BaseBooksApiImpl {
  getByQuery(query: string): Promise<Book[]>;
}

export class BaseBooksApi implements BaseBooksApiImpl {
  getByQuery(_query: string): Promise<Book[]> {
    throw new Error('Method not implemented.');
  }

  async apiGet<T>(url: string, params: Record<string, string | number> = {}): Promise<T> {
    const apiURL = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      apiURL.searchParams.append(key, value?.toString());
    });
    const res = await request({
      url: apiURL.href,
      method: 'GET',
    });
    return JSON.parse(res) as T;
  }
}
