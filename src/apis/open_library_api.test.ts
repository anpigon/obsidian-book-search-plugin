import { Book } from '@models/book.model';
import { OpenLibraryWork } from './models/open_library_response';
import { OpenLibraryApi } from './open_library_api';

describe('Open Library book creation', () => {
  const work: OpenLibraryWork = {
    key: '/works/OL278571W',
    title: 'Flow',
    author_name: ['Mihaly Csikszentmihalyi'],
    publisher: ['HarperCollins', 'Harper Perennial'],
    first_publish_year: 1990,
    number_of_pages_median: 317,
    isbn: ['0060920432', '9780060920432'],
    cover_i: 11041932,
    subject: ['Nonfiction', 'Psychology', 'Happiness', 'Attention'],
    editions: {
      numFound: 25,
      docs: [
        {
          key: '/books/OL24266006M',
          title: 'Flow',
          subtitle: 'The Psychology of Optimal Experience',
          publisher: ['Harper Perennial Modern Classics'],
          publish_date: ['2008'],
          number_of_pages: 336,
          isbn: ['9780061548123', '0061876720'],
          cover_i: 6414772,
        },
      ],
    },
  };

  const api = new OpenLibraryApi('en');
  const book: Book = api.createBookItem(work);

  it('Prefers edition fields', () => {
    expect(book.title).toEqual('Flow');
    expect(book.subtitle).toEqual('The Psychology of Optimal Experience');
    expect(book.publisher).toEqual('Harper Perennial Modern Classics');
    expect(book.publishDate).toEqual('2008');
    expect(book.totalPage).toEqual(336);
  });

  it('Author and categories', () => {
    expect(book.author).toEqual('Mihaly Csikszentmihalyi');
    expect(book.authors).toEqual(['Mihaly Csikszentmihalyi']);
    expect(book.category).toEqual('Nonfiction, Psychology, Happiness');
    expect(book.categories).toEqual(work.subject);
  });

  it('ISBNs', () => {
    expect(book.isbn10).toEqual('0061876720');
    expect(book.isbn13).toEqual('9780061548123');
  });

  it('Cover URLs', () => {
    expect(book.coverUrl).toEqual('https://covers.openlibrary.org/b/id/6414772-M.jpg');
    expect(book.coverSmallUrl).toEqual('https://covers.openlibrary.org/b/id/6414772-S.jpg');
    expect(book.coverLargeUrl).toEqual('https://covers.openlibrary.org/b/id/6414772-L.jpg');
  });

  it('Links', () => {
    expect(book.link).toEqual('https://openlibrary.org/works/OL278571W');
    expect(book.previewLink).toEqual('https://openlibrary.org/books/OL24266006M');
  });

  it('Falls back to work fields without an edition', () => {
    const fallback = api.createBookItem({ ...work, editions: undefined });
    expect(fallback.publisher).toEqual('HarperCollins');
    expect(fallback.publishDate).toEqual('1990');
    expect(fallback.totalPage).toEqual(317);
    expect(fallback.isbn10).toEqual('0060920432');
    expect(fallback.isbn13).toEqual('9780060920432');
    expect(fallback.coverUrl).toEqual('https://covers.openlibrary.org/b/id/11041932-M.jpg');
    expect(fallback.previewLink).toEqual('');
  });

  it('Does not mix work ISBNs into a matched edition', () => {
    const noIsbnEdition = api.createBookItem({
      ...work,
      editions: { numFound: 1, docs: [{ ...work.editions!.docs[0], isbn: undefined }] },
    });
    expect(noIsbnEdition.isbn10).toEqual('');
    expect(noIsbnEdition.isbn13).toEqual('');
  });

  it('Normalizes hyphenated ISBNs', () => {
    const hyphenated = api.createBookItem({
      ...work,
      editions: { numFound: 1, docs: [{ ...work.editions!.docs[0], isbn: ['978-0-06-154812-3', '0-06-187672-0'] }] },
    });
    expect(hyphenated.isbn10).toEqual('0061876720');
    expect(hyphenated.isbn13).toEqual('9780061548123');
  });

  it('Handles missing cover and authors', () => {
    const sparse = api.createBookItem({ key: '/works/OL1W', title: 'Untitled' });
    expect(sparse.author).toEqual('');
    expect(sparse.authors).toEqual([]);
    expect(sparse.coverUrl).toEqual('');
    expect(sparse.isbn13).toEqual('');
  });
});
