import { apiGet, BaseBooksApiImpl } from '@apis/base_api';
import { Book } from '@models/book.model';
import { OpenLibraryDoc, OpenLibrarySearchResponse } from './models/open_library_response';

const ISBN_RE = /^(97[89])?\d{9}[\dX]$/i;
const COVER_BASE = 'https://covers.openlibrary.org/b/id';
const FIELDS =
  'key,title,author_name,isbn,publisher,publish_year,subject,cover_i,number_of_pages_median,first_publish_year,language';

export class OpenLibraryApi implements BaseBooksApiImpl {
  private static readonly MAX_RESULTS = 20;

  async getByQuery(query: string): Promise<Book[]> {
    try {
      const cleanQuery = query.replace(/-/g, '');
      const isIsbn = ISBN_RE.test(cleanQuery);

      const params: Record<string, string | number> = {
        fields: FIELDS,
        limit: OpenLibraryApi.MAX_RESULTS,
      };

      if (isIsbn) {
        params['isbn'] = cleanQuery;
      } else {
        params['q'] = query;
      }

      const results = await apiGet<OpenLibrarySearchResponse>('https://openlibrary.org/search.json', params);
      if (!results?.numFound) return [];
      return results.docs.map(doc => this.createBookItem(doc));
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  private createBookItem(doc: OpenLibraryDoc): Book {
    const isbn13 = doc.isbn?.find(i => i.length === 13);
    const isbn10 = doc.isbn?.find(i => i.length === 10);
    const coverId = doc.cover_i;
    const smallCover = coverId ? `${COVER_BASE}/${coverId}-S.jpg` : '';
    const mediumCover = coverId ? `${COVER_BASE}/${coverId}-M.jpg` : '';
    const largeCover = coverId ? `${COVER_BASE}/${coverId}-L.jpg` : '';
    const publishYear = doc.publish_year?.[0] ?? doc.first_publish_year;

    return {
      title: doc.title,
      subtitle: '',
      author: doc.author_name?.join(', ') ?? '',
      authors: doc.author_name ?? [],
      category: doc.subject?.[0] ?? '',
      categories: doc.subject?.slice(0, 5) ?? [],
      publisher: doc.publisher?.[0] ?? '',
      publishDate: publishYear ? String(publishYear) : '',
      totalPage: doc.number_of_pages_median ?? '',
      coverUrl: mediumCover,
      coverSmallUrl: smallCover,
      coverMediumUrl: mediumCover,
      coverLargeUrl: largeCover,
      description: '',
      link: doc.key ? `https://openlibrary.org${doc.key}` : '',
      previewLink: '',
      ...(isbn13 ? { isbn13 } : {}),
      ...(isbn10 ? { isbn10 } : {}),
    };
  }
}
