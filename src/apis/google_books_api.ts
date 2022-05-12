import { request } from 'obsidian';
import { Book } from 'src/models/book.model';
import { GoogleBooksResponse, VolumeInfo } from './models/google_books.model';

const API_URL = 'https://www.googleapis.com/books/v1/volumes';

export async function getByQuery(query: string): Promise<Book[]> {
  try {
    const searchResults = await apiGet(query);
    if (searchResults.totalItems == 0) {
      throw new Error('No results found.');
    }

    return searchResults.items.map(({ volumeInfo }) => formatForSuggestion(volumeInfo));
  } catch (error) {
    console.warn(error);
    throw error;
  }
}

function getISBN(item: VolumeInfo) {
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

function formatForSuggestion(item: VolumeInfo): Book {
  const ISBN = getISBN(item);
  const book: Book = {
    title: item.title,
    author: formatList(item.authors),
    category: formatList(item.categories),
    publisher: item.publisher,
    totalPage: item.pageCount,
    coverUrl: `${item.imageLinks?.thumbnail ?? ''}`.replace('http:', 'https:'),
    publishDate: item.publishedDate ? `${new Date(item.publishedDate).getFullYear()}` : '',
    isbn10: ISBN.ISBN10,
    isbn13: ISBN.ISBN13,
  };
  return book;
}

function formatList(list?: string[]) {
  if (!list || list.length === 0 || list[0] == 'N/A') return '';
  if (list.length === 1) return list[0] ?? '';

  return list.map(item => `"${item.trim()}"`).join(', ');
}

async function apiGet(query: string): Promise<GoogleBooksResponse> {
  const finalURL = new URL(API_URL);
  finalURL.searchParams.append('q', query);

  const res = await request({
    url: finalURL.href,
    method: 'GET',
  });

  return JSON.parse(res) as GoogleBooksResponse;
}
